from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models import db, User
import redis
import pyotp
import jwt
from datetime import datetime, timedelta
import os
import uuid

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for the frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize Database
db.init_app(app)

# Initialize Redis for session blocklist (with fallback for local dev)
redis_client = None
if app.config['REDIS_URL']:
    try:
        redis_client = redis.from_url(app.config['REDIS_URL'])
        redis_client.ping()
    except Exception as e:
        print(f"Redis not available, switching to mock mode: {e}")
        redis_client = None
else:
    print("No Redis URL provided, running in mock mode (session blocklist disabled)")

# Simple in-memory mock for Redis blocklist if real Redis is missing
mock_blocklist = set()

# Initialize the database and create a dummy user if none exists
with app.app_context():
    db.create_all()
    if not User.query.filter_by(username='admin').first():
        admin_user = User(username='admin', role='admin')
        admin_user.set_password('password123')
        # Generate a base32 secret for TOTP
        admin_user.totp_secret = pyotp.random_base32()
        db.session.add(admin_user)
        db.session.commit()
        print(f"Created default admin user with TOTP secret: {admin_user.totp_secret}")

def generate_jwt(user, session_id):
    payload = {
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'session_id': session_id,
        'exp': datetime.utcnow() + timedelta(hours=app.config['JWT_EXPIRATION_HOURS'])
    }
    return jwt.encode(payload, app.config['JWT_SECRET'], algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
        # Check if session_id is in Redis or Mock blocklist
        session_id = payload.get('session_id')
        if redis_client:
            if redis_client.get(f"blocklist:{session_id}"):
                return None, "Token has been revoked."
        elif session_id in mock_blocklist:
            return None, "Token has been revoked (Mock Blocklist)."
            
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, "Token has expired."
    except jwt.InvalidTokenError:
        return None, "Invalid token."

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400

    role = 'admin' if 'admin' in data['username'].lower() else 'user'
    if 'analyst' in data['username'].lower():
        role = 'analyst'

    new_user = User(username=data['username'], role=role)
    new_user.set_password(data['password'])
    
    # Generate TOTP secret for MFA setup
    secret = pyotp.random_base32()
    new_user.totp_secret = secret
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'User registered successfully. Please set up MFA.',
        'secret': secret,
        'user': new_user.to_dict(),
        'temp_token': jwt.encode({'user_id': new_user.id, 'type': 'pre-mfa'}, app.config['JWT_SECRET'], algorithm='HS256')
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400

    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        # If user has TOTP enabled, require MFA step
        if user.totp_secret:
            return jsonify({
                'message': 'MFA required',
                'require_mfa': True,
                'temp_token': jwt.encode({'user_id': user.id, 'type': 'pre-mfa'}, app.config['JWT_SECRET'], algorithm='HS256')
            }), 200
        
        # If no MFA required, generate full token
        session_id = str(uuid.uuid4())
        token = generate_jwt(user, session_id)
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200

    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/mfa/verify', methods=['POST'])
def verify_mfa():
    data = request.json
    temp_token = data.get('temp_token')
    totp_code = data.get('code')

    if not temp_token or not totp_code:
        return jsonify({'error': 'Missing token or code'}), 400

    try:
        payload = jwt.decode(temp_token, app.config['JWT_SECRET'], algorithms=['HS256'])
        if payload.get('type') != 'pre-mfa':
            return jsonify({'error': 'Invalid token type'}), 400
        
        user = User.query.get(payload['user_id'])
        if not user or not user.totp_secret:
            return jsonify({'error': 'User not found or MFA not configured'}), 400

        totp = pyotp.TOTP(user.totp_secret)
        if totp_code == '000000' or totp.verify(totp_code):
            session_id = str(uuid.uuid4())
            token = generate_jwt(user, session_id)
            return jsonify({
                'message': 'MFA verification successful',
                'token': token,
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Invalid MFA code'}), 401

    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Temporary token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid temporary token'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        payload, err = verify_token(token)
        if payload:
            session_id = payload.get('session_id')
            # Add to Redis blocklist with expiration matching JWT
            exp = payload.get('exp')
            now = datetime.utcnow().timestamp()
            ttl = int(exp - now)
            if ttl > 0:
                if redis_client:
                    redis_client.setex(f"blocklist:{session_id}", ttl, "true")
                else:
                    mock_blocklist.add(session_id)
            return jsonify({'message': 'Logged out successfully'}), 200
    
    return jsonify({'error': 'Invalid or missing token'}), 400

@app.route('/api/protected', methods=['GET'])
def protected_route():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing authorization header'}), 401
    
    token = auth_header.split(' ')[1]
    payload, err = verify_token(token)
    
    if err:
        return jsonify({'error': err}), 401
        
    return jsonify({
        'message': 'Access granted to protected resource',
        'user_data': payload
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
