# SmartLeave - Leave Management System

A comprehensive, role-based leave management platform built with modern web technologies. SmartLeave streamlines the process of leave requests, approvals, and management for organizations with multi-level hierarchies (Admin, Manager, Employee).

---

## 🌐 Live Demo

- **Frontend**: [https://leave-management-system-topaz.vercel.app](https://leave-management-system-topaz.vercel.app)
- **Backend API**: [https://leave-management-system-backend-mg2o.onrender.com/api](https://leave-management-system-backend-mg2o.onrender.com/api)

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: CSS
- **Deployment**: Vercel
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Render

### Database
- **Database**: MongoDB Atlas
- **ORM**: Mongoose

---

## ✨ Features

- **User Authentication**: Secure login system with role-based access
- **Role-Based Access Control (RBAC)**: Separate dashboards for Admin, Manager, and Employee roles
- **Leave Application**: Employees can apply for leave with detailed information
- **Leave Approval Workflow**: Managers can review and approve/reject leave requests
- **Department Management**: Organize and manage employees by department with access control
- **Leave Types**: Configurable leave types with category-based rules
- **Holiday Management**: Define company holidays and exclude them from leave calculations
- **Document Upload**: Support for document uploads (Sick Leave only)
- **Employee Management**: Full CRUD operations for employee records
- **Dashboard**: Role-specific dashboards with key metrics and pending actions
- **Performance & Analytics**: Leave statistics and employee performance tracking

---

## 🏗 Project Architecture

```
SmartLeave (Full-Stack Application)
│
├── Frontend (React + Vite)
│   ├── Components: Reusable UI components (Navbar, Sidebar, Table, Card, Forms)
│   ├── Pages: Route-specific pages (Login, Dashboards, Leave Management)
│   ├── Context: Global state management (Auth, Employee, Leave, Notification)
│   ├── Services: API integration (Axios)
│   └── Deployment: Vercel
│
├── Backend (Node.js + Express)
│   ├── Controllers: Business logic for each module
│   ├── Models: Mongoose schemas (User, Leave, LeaveType, Holiday)
│   ├── Routes: API endpoints
│   ├── Middleware: Auth, error handling, file uploads
│   ├── Config: Database connection
│   └── Deployment: Render
│
└── Database (MongoDB Atlas)
    ├── Users: Contains user credentials and role information
    ├── Leaves: Leave request records
    ├── LeaveTypes: Leave category definitions
    └── Holidays: Company holiday calendar
```

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (for cloud database)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LEAVE_MANAGEMENT_SYSTEM/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```
   (Configure environment variables as shown below)

4. **Start the server**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```
   (Configure environment variables as shown below)

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`.env`)
```env
# Database
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database_name>

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# CORS Origins
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=SmartLeave
```

---

## 📡 API Endpoints Overview

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Employee Routes
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Leave Routes
- `GET /api/leaves` - Get all leave requests
- `POST /api/leaves` - Apply for leave
- `PUT /api/leaves/:id` - Update leave status
- `GET /api/leaves/:id` - Get leave details

### Leave Type Routes
- `GET /api/leave-types` - Get all leave types
- `POST /api/leave-types` - Create leave type
- `PUT /api/leave-types/:id` - Update leave type

### Holiday Routes
- `GET /api/holidays` - Get all holidays
- `POST /api/holidays` - Add holiday
- `DELETE /api/holidays/:id` - Remove holiday

---

## � License

This project is licensed under the MIT License - see the LICENSE file for details.
