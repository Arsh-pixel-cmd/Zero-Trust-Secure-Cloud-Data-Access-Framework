import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-replace-in-prod')
    # PostgreSQL connection string with SQLite fallback for local dev
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///zerotrust.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Redis configuration for session blocklist (None will trigger mock mode)
    REDIS_URL = os.environ.get('REDIS_URL', None)
    
    # JWT configuration
    JWT_SECRET = os.environ.get('JWT_SECRET', 'jwt-secret-key-replace-in-prod')
    JWT_EXPIRATION_HOURS = 1
