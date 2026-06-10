# JobNexus — User Manual & Execution Guide

A full-stack MERN job portal and resume builder platform with multi-role authentication (Candidates, Employers, and Admins).

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [User Roles & Features](#user-roles--features)
7. [User Workflows](#user-workflows)
8. [API Endpoints Summary](#api-endpoints-summary)
9. [Troubleshooting](#troubleshooting)
10. [Project Architecture](#project-architecture)

---

## Quick Start

### For Development (All-in-One Setup)

```bash
# 1. Clone and navigate to project root
cd c:\Projects\Job-Portal-with-Resume-Builder

# 2. Install frontend dependencies
npm install

# 3. Navigate to backend and install dependencies
cd backend
npm install
cd ..

# 4. Set up environment variables (see section below)
# Create backend/.env file

# 5. Start backend server (in one terminal)
cd backend
npm run dev

# 6. Start frontend dev server (in another terminal)
npm run dev

# Frontend will be at: http://localhost:5173
# Backend API at: http://localhost:5000
```

---

## System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **MongoDB**: Local instance OR MongoDB Atlas account
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge
- **RAM**: Minimum 4GB
- **Disk Space**: Minimum 500MB for node_modules

---

## Installation

### Step 1: Clone/Navigate to Project

```bash
cd c:\Projects\Job-Portal-with-Resume-Builder
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

**Key packages installed:**
- React 19
- Vite (build tool)
- React Router (navigation)
- Tailwind CSS (styling)
- @react-pdf/renderer (PDF export)
- React Icons
- React Hot Toast (notifications)

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

**Key packages installed:**
- Express.js 5 (web framework)
- MongoDB/Mongoose (database)
- JWT (authentication)
- bcryptjs (password hashing)
- CORS (cross-origin requests)
- Cookie Parser (session handling)

---

## Environment Configuration

### Backend Environment Setup

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jobnexus?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_in_production_12345678

# Server Configuration
NODE_ENV=development
PORT=5000

# CORS Configuration (for local development)
CORS_ORIGINS=http://localhost:5173
ALLOW_VERCEL_PREVIEWS=false
```

### Getting MongoDB Connection String

**Option 1: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a project and cluster
4. Click "Connect" and copy the connection string
5. Replace `<password>` with your database user password
6. Add `/jobnexus?retryWrites=true&w=majority` at the end

**Option 2: Local MongoDB**
```env
MONGO_URI=mongodb://localhost:27017/jobnexus
```

### Generating JWT_SECRET

```bash
# Use Node.js to generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Running the Application

### Development Mode (Recommended)

#### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
[Backend] Server running on http://localhost:5000
[Backend] Connected to MongoDB
```

#### Terminal 2: Start Frontend Dev Server

```bash
# From project root
npm run dev
```

Expected output:
```
  VITE v7.1.7  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press q to quit
```

**Frontend URL**: http://localhost:5173

### Production Build

```bash
# Build frontend
npm run build

# Output will be in 'dist/' directory
```

### Preview Production Build

```bash
npm run preview
```

---

## User Roles & Features

### 1. **Candidate**

**What is a Candidate?**
A job seeker looking for employment opportunities.

**Features:**
- ✅ Register and create an account
- ✅ Browse all available jobs with filters
- ✅ View detailed job descriptions
- ✅ Apply to jobs using a selected resume
- ✅ Track all applications from dashboard
- ✅ View application status and timeline
- ✅ Build multiple resumes with live preview
- ✅ Download resumes as PDF
- ✅ Rename, save, and delete resumes
- ✅ Manage profile and credentials

**Resume Builder Sections:**
- Personal Information (name, email, phone, location)
- Education (degree, institution, dates)
- Experience (job title, company, duration, responsibilities)
- Projects (name, description, technologies, links)
- Skills (skill name, proficiency level)
- Languages (language, proficiency)
- Certifications (name, issuer, date)

---

### 2. **Employer**

**What is an Employer?**
A company representative hiring candidates.

**Features:**
- ✅ Register and create company account
- ✅ Complete company profile (name, description, logo, location)
- ✅ Post new job listings
- ✅ Edit existing job postings
- ✅ Close/Reopen jobs
- ✅ View all applicants for each job
- ✅ Accept/Reject applications
- ✅ View candidate resumes
- ✅ Track hiring metrics on dashboard
- ✅ Manage company information

**Job Posting Details:**
- Job Title
- Job Description
- Requirements
- Salary Range (optional)
- Location
- Job Type (Full-time, Part-time, Contract)
- Experience Level

---

### 3. **Admin**

**What is an Admin?**
Platform moderator with oversight of all activities.

**Features:**
- ✅ Access centralized Admin Dashboard
- ✅ View platform-wide metrics and statistics
- ✅ Manage all users (verify, suspend, role updates)
- ✅ Moderate jobs (approve, reject, feature, flag)
- ✅ Activate/Deactivate jobs
- ✅ Review all applications across platform
- ✅ Handle reported job listings
- ✅ Remove inappropriate content
- ✅ Monitor user activity

---

## User Workflows

### Workflow 1: Candidate Job Search & Application

```
1. Sign Up as Candidate
   └─ Provide: Name, Email, Password

2. Build Resume (Optional but Recommended)
   ├─ Navigate to "Resume Builder"
   ├─ Fill in: Personal Info, Education, Experience, Skills
   ├─ Preview in real-time
   ├─ Save resume

3. Browse Jobs
   ├─ Go to "Jobs" page
   ├─ Use filters (location, job type, salary range)
   ├─ Search by keywords

4. View Job Details
   ├─ Click on job listing
   ├─ Review job description, requirements, salary
   ├─ View employer company profile

5. Apply to Job
   ├─ Click "Apply Now"
   ├─ Select a resume from your saved resumes
   ├─ Confirm application

6. Track Applications
   ├─ Go to "My Applications"
   ├─ View all applications with status
   ├─ See timeline of each application
   ├─ Track: Applied → Under Review → Accepted/Rejected
```

### Workflow 2: Employer Job Posting & Hiring

```
1. Sign Up as Employer
   └─ Provide: Company Name, Email, Password

2. Complete Company Profile
   ├─ Navigate to "Company Profile"
   ├─ Add: Company Description, Logo, Location, Website
   ├─ Save profile

3. Post Job Listing
   ├─ Click "Post New Job"
   ├─ Fill in: Title, Description, Requirements, Salary, Location
   ├─ Set job type and experience level
   ├─ Publish job

4. View Applications
   ├─ Go to "Applicants" section
   ├─ For each job, view candidate list
   ├─ Click on applicant to view full resume

5. Manage Applications
   ├─ Review candidate resumes
   ├─ Accept qualified candidates
   ├─ Reject unsuitable candidates
   ├─ Send notifications (if available)

6. Manage Jobs
   ├─ Edit open jobs
   ├─ Close completed jobs
   ├─ Reopen jobs as needed
   ├─ Delete old job postings
```

### Workflow 3: Admin Moderation

```
1. Login as Admin
   └─ Navigate to Admin Dashboard

2. Monitor Platform
   ├─ View total users, jobs, applications
   ├─ Review user registration trends
   ├─ Monitor job postings

3. Manage Users
   ├─ View all users (Candidates, Employers)
   ├─ Verify user accounts
   ├─ Suspend/Ban problematic users
   ├─ Update user roles if needed

4. Moderate Jobs
   ├─ Review all job postings
   ├─ Approve new jobs
   ├─ Reject non-compliant jobs
   ├─ Feature popular jobs

5. Handle Reports
   ├─ Review reported job listings
   ├─ Investigate inappropriate content
   ├─ Remove flagged jobs
   ├─ Remove offending employers

6. Review Applications
   ├─ Monitor application trends
   ├─ Identify suspicious patterns
   ├─ Support dispute resolution
```

---

## API Endpoints Summary

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/register` | Register new user (Candidate/Employer) |
| POST | `/login` | Login user, get JWT token |
| POST | `/logout` | Logout user, clear session |
| GET | `/me` | Get current authenticated user |
| POST | `/verify-password` | Verify user password |

### Job Routes (`/api/jobs`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get all jobs with pagination/filters |
| GET | `/:id` | Get job details |
| POST | `/` | Create new job (Employer) |
| PUT | `/:id` | Update job (Employer) |
| DELETE | `/:id` | Delete job (Employer) |
| POST | `/:id/close` | Close job (Employer) |
| POST | `/:id/reopen` | Reopen job (Employer) |
| POST | `/:id/report` | Report job listing (Candidate) |

### Application Routes (`/api/applications`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/` | Apply to job |
| GET | `/my-applications` | Get candidate's applications |
| GET | `/job/:jobId/applicants` | Get applicants for job (Employer) |
| PUT | `/:id/status` | Update application status (Employer) |
| GET | `/:id` | Get application details |

### Resume Routes (`/api/resume`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/` | Create/Save resume |
| GET | `/` | Get all user's resumes |
| GET | `/:id` | Get single resume details |
| PUT | `/:id` | Update resume |
| POST | `/:id/rename` | Rename resume |
| DELETE | `/:id` | Delete resume |

### User Routes (`/api/users`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/profile` | Get user profile |
| PUT | `/profile` | Update user profile |
| PUT | `/credentials` | Update email/password |
| DELETE | `/account` | Delete user account |
| GET | `/company/:companyName` | Get company profile |
| PUT | `/company` | Update company profile |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/dashboard` | Get admin dashboard metrics |
| GET | `/users` | Get all users |
| PUT | `/users/:id` | Update user (verify/suspend) |
| GET | `/jobs` | Get all jobs for moderation |
| PUT | `/jobs/:id` | Update job (approve/reject/feature) |
| GET | `/applications` | Get all applications |
| GET | `/reports` | Get reported jobs |
| DELETE | `/reports/:id` | Handle report |

---

## Troubleshooting

### Issue: Backend won't start

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use a different port in backend/.env
PORT=5001
```

### Issue: MongoDB Connection Error

**Problem:** `connectionrefus: connection refused`

**Solutions:**
1. Check MONGO_URI is correct
2. Verify MongoDB Atlas IP whitelist includes your IP
3. Check internet connection
4. Try local MongoDB: `mongodb://localhost:27017/jobnexus`

### Issue: CORS Error in Browser Console

**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
1. Ensure backend `.env` has correct `CORS_ORIGINS`:
   ```env
   CORS_ORIGINS=http://localhost:5173
   ```
2. Restart backend server after env changes
3. Clear browser cache: `Ctrl+Shift+Delete`

### Issue: Frontend can't connect to backend

**Problem:** `Network Error: Failed to fetch`

**Solutions:**
1. Verify backend is running: `http://localhost:5000`
2. Check `config.js` API URL:
   ```javascript
   // Should be: http://localhost:5000 for development
   ```
3. Test API directly: `curl http://localhost:5000/api/health`

### Issue: "Invalid Token" Error

**Problem:** `Error: Invalid token` when logged in

**Solutions:**
1. Clear cookies: Open DevTools → Application → Cookies → Delete all
2. Clear localStorage: DevTools → Application → Local Storage → Clear
3. Log out and log in again
4. Check JWT_SECRET in backend `.env` is set correctly

### Issue: Resume PDF Download Not Working

**Problem:** PDF fails to download or is blank

**Solutions:**
1. Ensure all form fields are filled
2. Update @react-pdf/renderer: `npm install --save @react-pdf/renderer@latest`
3. Restart frontend dev server

### Issue: Port Already in Use (Frontend)

**Problem:** `error  Port 5173 is in use`

**Solution:**
```bash
# Use different port
npm run dev -- --port 5174
```

---

## Project Architecture

### Directory Structure

```
Job-Portal-with-Resume-Builder/
├── src/                          # Frontend (React)
│   ├── components/              # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── ApplyModal.jsx
│   │   ├── ResumeForm.jsx
│   │   ├── ResumePdf.jsx
│   │   └── Modals/
│   ├── pages/                   # Route pages
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── Home.jsx
│   │   ├── Jobs.jsx
│   │   ├── JobDetails.jsx
│   │   ├── MyApplications.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── EmployerDashBoard.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminJobs.jsx
│   │   │   └── AdminApplications.jsx
│   ├── utils/                   # Helper functions
│   │   └── cookies.js
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # React entry point
│   └── config.js                # API configuration
│
├── backend/                      # Express Backend
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── controllers/             # Business logic
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── resumeController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── middleware/              # Route guards
│   │   ├── auth.js              # JWT authentication
│   │   ├── role.js              # Role-based access
│   │   ├── admin.js             # Admin only
│   │   └── employerOnly.js
│   ├── models/                  # Database schemas
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   ├── resume.js
│   │   └── JobReport.js
│   ├── routes/                  # API endpoints
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   ├── server.js                # Express app entry point
│   ├── package.json
│   └── .env                     # Environment variables
│
├── public/                      # Static assets
├── docs/                        # Documentation
│   ├── ERD.md                   # Entity Relationship Diagram
│   └── screenshots/
├── package.json                 # Frontend dependencies
├── vite.config.js               # Vite configuration
├── eslint.config.js             # Linting rules
└── README.md                    # Project README
```

### Technology Stack

**Frontend:**
- React 19 (UI framework)
- Vite (build tool, dev server)
- React Router v7 (routing)
- Tailwind CSS v4 (styling)
- @react-pdf/renderer (PDF generation)

**Backend:**
- Node.js (runtime)
- Express.js 5 (web framework)
- MongoDB (database)
- Mongoose (ODM)
- JWT (authentication)
- bcryptjs (password hashing)
- CORS (cross-origin requests)

### Data Flow

```
1. User Action (Frontend)
   ↓
2. React Component Handler
   ↓
3. API Request (with JWT in cookies)
   ↓
4. Express Middleware (auth check)
   ↓
5. Route Handler → Controller
   ↓
6. Database Query (Mongoose)
   ↓
7. JSON Response (Backend)
   ↓
8. React State Update (Frontend)
   ↓
9. UI Re-render
```

### Authentication Flow

```
LOGIN:
User Input → API Request → Hash Check → JWT Created → 
Cookie Set → ✓ Authenticated

AUTHENTICATED REQUEST:
API Request with Cookie → JWT Extracted → JWT Verified → 
Access Granted → Execute Controller Logic

LOGOUT:
Clear Cookie → Clear localStorage → Redirect to Login
```

---

## Development Tips

### Hot Module Replacement (HMR)
Frontend changes auto-reload without losing state. Just save your file!

### Backend Auto-Reload
Backend uses `nodemon` in dev mode. Changes to files automatically restart the server.

### Debug Mode
Use `console.log()` in:
- **Frontend**: Check DevTools Console (F12)
- **Backend**: Check terminal output

### Sample Accounts for Testing

**Admin Account:**
```
Email: admin@jobnexus.com
Password: Admin@123
```

**Sample Employer:**
```
Email: employer@company.com
Password: Employer@123
```

**Sample Candidate:**
```
Email: candidate@email.com
Password: Candidate@123
```

---

## Important Notes

### Security

- ✅ Passwords are hashed with bcryptjs
- ✅ JWT tokens are stored in httpOnly cookies
- ✅ Role-based access control on backend middleware
- ✅ CORS configured for authorized origins
- ⚠️ Always use strong JWT_SECRET in production
- ⚠️ Enable HTTPS in production
- ⚠️ Set `secure: true` on cookies in production

### Performance

- Frontend uses React 19 and Vite for fast build times
- MongoDB indexing on frequently queried fields
- Pagination implemented on jobs and applications
- Lazy loading of components in development

### Scaling

- Backend can be scaled horizontally (multiple instances)
- MongoDB Atlas supports auto-scaling
- Frontend deployed on Vercel (auto-scaling)
- Backend deployed on Render (auto-scaling)

---

## Common Commands Reference

```bash
# Frontend
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start with auto-reload (nodemon)
npm start            # Start normally
npm test             # Run tests

# Git (if using version control)
git status           # Check changes
git add .            # Stage changes
git commit -m "msg"  # Commit changes
git push             # Push to remote
```

---

## Support & Contribution

For issues or feature requests, please refer to the project repository.

**Deployment:** 
- Frontend: https://job-portal-resume-builder.vercel.app
- Backend: https://job-portal-backend-hptt.onrender.com

---

**Last Updated:** May 2026

**Version:** 1.0.0
