# Authra - Enterprise Security & RBAC Platform

Authra is a robust, enterprise-grade authentication and authorization platform built on the MERN stack. It features a sophisticated Role-Based Access Control (RBAC) system, advanced session management, and multi-factor authentication designed for secure organizational environments.

## 🚀 Overview

Authra provides a complete solution for managing users, organizations, and administrative security. It is designed with a "Security-First" approach, incorporating modern best practices like rate limiting, brute-force protection, and granular permission matrices.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TailwindCSS, Framer Motion, Lucide React, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Security**: JWT, BcryptJS, Express-Rate-Limit, Helmet, HPP, XSS-Clean
- **Utilities**: Nodemailer (OTP), Winston (Logging), GeoIP-Lite (Session Tracking)

## ✨ Core Features

### 🔐 Advanced Security
- **Multi-Factor Authentication (2FA)**: Email-based OTP verification for administrative logins.
- **Brute-Force Protection**: Account locking after multiple failed attempts and cooldown periods for OTP resends.
- **Secure Headers**: Implementation of Helmet and HPP to prevent common web vulnerabilities.
- **Session Management**: Real-time tracking of active sessions with device and location insights.

### 🛡️ Enterprise RBAC
- **Granular Permissions**: A central permission matrix defining access levels for:
  - `Super Admin`: Full system control.
  - `Admin`: Global administrative capabilities.
  - `Org Owner`: Management of specific organization resources.
  - `Org Staff`: Operational access within an organization.
  - `User`: Standard platform access.
- **Dynamic UI**: Navigation and interface elements render conditionally based on user permissions.

### 🏢 Organization Management
- **Branding**: Custom logos and authorized signatures for organization-specific outputs (e.g., certificates).
- **User Allocation**: Managing staff and users within specific organizational boundaries.

## 📂 Project Structure

```text
authra/
├── backend/                # Express API
│   ├── core/               # Shared logic (middleware, services, utils)
│   ├── models/             # Mongoose schemas
│   ├── modules/            # Domain-specific modules (admin, auth, orgs, etc.)
│   ├── routes/             # Main API entry points
│   └── server.js           # Server initialization
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # UI components (layout, auth, common)
│   │   ├── context/        # Global state (Auth, Security)
│   │   ├── pages/          # Application views
│   │   ├── utils/          # Client-side helpers (RBAC engine)
│   │   └── App.jsx         # Routing and core logic
│   └── vite.config.js      # Vite configuration
└── README.md               # You are here
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- NPM or Yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd authra
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in `backend/` and add:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   EMAIL_HOST=your_smtp_host
   EMAIL_PORT=587
   EMAIL_USER=your_email
   EMAIL_PASS=your_password
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in `frontend/` and add:
   ```env
   VITE_API_URL=http://localhost:5001/api/v1
   ```

### Running the Application

- **Run Backend (Dev)**: `cd backend && npm run dev`
- **Run Frontend (Dev)**: `cd frontend && npm run dev`

## 🛡️ API Protection Example

Routes are protected using a combination of JWT verification and RBAC middleware:

```javascript
// Example: Restricting to Admins
router.get('/stats', 
  protect, 
  authorize('super_admin', 'admin'), 
  getAdminStats
);
```

## 📜 License

This project is proprietary and confidential. Authorized use only.
