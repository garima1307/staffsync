# StaffSync – Modern Human Resource Management Solution

StaffSync is a comprehensive web-based Human Resource Management (HRM) application built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). It streamlines and automates core HR processes with distinct roles and access levels for **HR personnel, managers, and employees**, ensuring efficient management and transparency across all operations.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Database Collections](#database-collections)
5. [Core Modules](#core-modules)
6. [Demo Accounts](#demo-accounts)
7. [Project Structure](#project-structure)
8. [Installation & Setup](#installation--setup)
9. [Environment Variables](#environment-variables)
10. [API Overview](#api-overview)

---

## Overview

The HRM system lets HR personnel, managers, and employees manage employee information, attendance, leave requests, announcements, and training activities through a secure and user-friendly interface.

- **HR** manages employee data, handles leave approvals, tracks company attendance, and posts announcements or news.
- **Employees** apply for leaves, maintain personal records, mark attendance, and stay updated with company announcements.
- **Managers** oversee leave requests and manage training and development programs for their teams.

---

## Key Features

- **Secure JWT Authentication**: Role-based access control (HR, Manager, Employee) with bcrypt password encryption.
- **Employee Management**: Comprehensive employee directory, departmental assignments, and manager hierarchy.
- **Daily Attendance**: One-click Clock In / Clock Out, punctuality status (Present, Late, Half-day), and work hours computation.
- **Leave Requests Workflow**: Multi-type leave requests (Sick, Casual, Annual, Maternity, Unpaid) with manager approval/rejection remarks.
- **Announcements**: Organization-wide broadcasts with category and priority badges.
- **Training & Upskilling**: Workshop scheduling, capacity caps, and 1-click employee enrollments.
- **Real-Time Notifications**: Instant updates on leave approvals, new announcements, and training confirmations.
- **Modern Responsive Design**: Polished SaaS interface built with React, Redux Toolkit, and Lucide icons.

---

## Tech Stack

### Backend
- **Node.js** & **Express.js** RESTful API
- **MongoDB** & **Mongoose** ODM
- **JSON Web Token (JWT)** & **bcryptjs**
- **CORS**, **Dotenv**, **Morgan**

### Frontend
- **React.js 18**
- **Redux Toolkit** (Global state management)
- **React Router 6** (Role-protected client routing)
- **Axios** (With JWT interceptors)
- **Lucide React** (Icons)

---

## Demo Accounts

StaffSync includes preconfigured demo accounts for all roles (run `npm run seed` in the backend):

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **HR Director** | `hr@staffsync.com` | `admin123` | Full system administrative access, employee CRUD, company attendance, announcements |
| **Manager** | `manager@staffsync.com` | `manager123` | Team oversight, leave approvals, team attendance, training programs |
| **Employee** | `employee@staffsync.com` | `employee123` | Self profile, attendance check-in/out, leave applications, training enrollment |

*(The login page also provides 1-click buttons to instantly autofill these credentials for testing).*

---

## Project Structure

```
staffsync/
├── backend/
│   ├── config/          # DB connection (db.js)
│   ├── controllers/     # Route handlers (auth, employee, attendance, leaves, etc.)
│   ├── middleware/      # Auth, role check, error handler
│   ├── models/          # Mongoose schemas (User, Employee, Attendance, Leave, etc.)
│   ├── routes/          # Express routes
│   ├── utils/           # Seed data and token generators
│   ├── server.js        # Main Express server entrypoint
│   └── .env             # Environment configuration
├── frontend/
│   ├── public/          # Favicon, assets
│   ├── src/
│       ├── components/  # Navbar, Sidebar, StatCard, Modal
│       ├── pages/       # Home, Login, Register, Dashboard, Employees, Attendance, Leaves, etc.
│       ├── redux/       # Store & slices (auth, employee, attendance, leave, etc.)
│       ├── routes/      # ProtectedRoute & RoleRoute
│       ├── services/    # Axios instance & interceptors
│       ├── App.jsx      # Top-level routing
│       ├── index.jsx    # React DOM root
│       └── index.css    # Clean responsive styling
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm (v8+)
- MongoDB (Running locally on `mongodb://localhost:27017` or MongoDB Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install

# Seed the database with demo accounts and data
npm run seed

# Start development server (Port 5000)
npm run dev
# OR for production:
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Vite React development server (Port 3000)
npm start
# OR
npm run dev
```

Visit **http://localhost:3000** in your web browser.

---

## Environment Variables

Located in `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/staffsync
JWT_SECRET=staffsync_super_secret_jwt_key_2026_modern_hrm
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## API Overview

| Module | Method | Endpoint | Access |
|---|---|---|---|
| Auth | POST | `/api/auth/register` | Public |
| Auth | POST | `/api/auth/login` | Public |
| Auth | GET | `/api/auth/me` | Authenticated |
| Employees | GET/POST | `/api/employees` | HR / Manager |
| Employees | GET/PUT/DEL | `/api/employees/:id` | HR / Self |
| Attendance | POST | `/api/attendance/check-in` | Authenticated |
| Attendance | POST | `/api/attendance/check-out` | Authenticated |
| Attendance | GET | `/api/attendance/my` | Authenticated |
| Attendance | GET | `/api/attendance` | HR / Manager |
| Attendance | POST | `/api/attendance/manual` | HR |
| Leaves | POST | `/api/leaves` | Authenticated |
| Leaves | GET | `/api/leaves/my` | Authenticated |
| Leaves | GET | `/api/leaves` | HR / Manager |
| Leaves | PUT | `/api/leaves/:id` | HR / Manager |
| Announcements | GET | `/api/announcements` | Authenticated |
| Announcements | POST | `/api/announcements` | HR |
| Trainings | GET | `/api/trainings` | Authenticated |
| Trainings | POST | `/api/trainings` | HR / Manager |
| Trainings | POST | `/api/trainings/:id/enroll` | Authenticated |
| Notifications | GET | `/api/notifications` | Authenticated |
| Notifications | PUT | `/api/notifications/read-all` | Authenticated |
