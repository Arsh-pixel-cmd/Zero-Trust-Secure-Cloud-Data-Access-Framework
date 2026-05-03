# Adaptive Zero Trust Security Framework (AZTSF)
### A NIST SP 800-207 Compliant Identity & Access Management System
**College Minor Project Submission**

---

## 🚀 Project Overview
The **Adaptive Zero Trust Security Framework** is a full-stack implementation of modern cybersecurity principles. Unlike traditional perimeter-based security, this system operates on the core philosophy of **"Never Trust, Always Verify."** It utilizes real-time environmental telemetry, identity verification, and a continuous adaptive risk engine to determine whether a user session should remain active.

This project was built to demonstrate the practical application of the Zero Trust Model in a cloud-native, microservices-oriented environment.

## 🛡️ Core Security Features
- **Multi-Factor Authentication (MFA)**: Enforces TOTP (Time-based One-Time Password) standards using the RFC 6238 algorithm.
- **Continuous Adaptive Risk Scoring**: A dynamic engine that calculates risk scores (0.0 to 1.0) based on telemetry data including IP reputation, device fingerprinting, and behavioral anomalies.
- **Instant Implicit Revocation**: Integrated with **Redis** to provide sub-millisecond session invalidation. If a user's risk exceeds the policy threshold, their JWT is instantly added to a distributed blocklist.
- **AI-Driven Telemetry Analysis**: Utilizes **Google Gemini AI** to provide security insights, audit log summarization, and interactive security assistance.
- **NIST 800-207 Architecture**: Implements the logical components of Zero Trust:
  - **Policy Decision Point (PDP)**: The Backend API logic.
  - **Policy Enforcement Point (PEP)**: Middleware and Redis-backed session guards.
  - **Policy Information Point (PIP)**: The PostgreSQL user database and Risk Telemetry.

## 🏗️ Technical Architecture
### Frontend (The Control Plane)
- **Framework**: React.js with Vite
- **Styling**: Vanilla CSS with modern Glassmorphism aesthetics
- **Icons**: Lucide React
- **Security**: Client-side JWT handling and Risk Telemetry simulation

### Backend (The Data Plane)
- **API**: Python Flask (RESTful Architecture)
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL (Production-grade relational storage)
- **Cache**: Redis (High-speed session revocation layer)
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing

### Infrastructure
- **Containerization**: Docker & Docker Compose for seamless environment orchestration.
- **AI Engine**: Google Gemini API for intelligent security auditing.

## ⚙️ Setup and Installation

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)

### Step-by-Step Installation
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd arsh-project
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root and add your Google Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_key_here
   ```

3. **Launch the Full Stack**:
   ```bash
   docker-compose up --build -d
   ```

4. **Access the Application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5001`

## 📊 How to Demonstrate (Testing Flow)
The project includes a built-in **Risk Engine Panel** for live demonstration:
1. **Establish Trust**: Sign up, verify MFA, and log in to reach the dashboard.
2. **Environmental Shift**: Using the right-side panel, toggle risk factors like "Bad IP" or "Impossible Travel."
3. **Threshold Violation**: Once the cumulative Risk Index hits **0.70**, the backend will automatically revoke your session.
4. **Audit**: Observe the terminal logs (`docker-compose logs -f backend`) to see the JWT being pushed to the Redis blocklist in real-time.

## 📈 Future Scope
- **mTLS Integration**: Implementing Mutual TLS for service-to-service authentication.
- **FIDO2/WebAuthn Support**: Moving towards passwordless hardware-based security.
- **SIEM Integration**: Exporting logs to ELK Stack or Splunk for advanced forensics.

---
**Developed by:** [Your Name]
**Project Supervisor:** [Supervisor Name]
**Academic Year:** 2023-2024
