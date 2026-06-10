import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import Companies from "./pages/Companies.jsx";
import CompanyProfileView from "./pages/CompanyProfileView.jsx";
import CompanyJobs from "./pages/CompanyJobs.jsx";
import ResumePreviewPage from "./pages/ResumePreviewPage.jsx";
import MyApplications from "./pages/MyApplications.jsx";
import PostJob from "./pages/PostJob.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import EmployerDashboard from "./pages/EmployerDashBoard.jsx";
import Home from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Applicants from "./pages/Applicants.jsx";

// NEW PROFILE PAGES
import ProfilePage from "./pages/ProfilePage.jsx";
import EmployerProfile from "./pages/EmployerProfile.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminJobs from "./pages/admin/AdminJobs.jsx";
import AdminApplications from "./pages/admin/AdminApplications.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";
import EditJob from "./pages/EditJob.jsx";
import logo from "./assets/logo.png";

import "./index.css";

const favicon = document.querySelector("link[rel='icon']");
if (favicon) {
  favicon.setAttribute("href", logo);
  favicon.setAttribute("type", "image/png");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Resume Builder */}
        <Route path="/resume" element={<App />} />

        {/* Resume Preview */}
        <Route path="/resume/:resumeId" element={<ResumePreviewPage />} />

        {/* Job Portal */}
        <Route path="/jobs" element={<Jobs />} />

        {/* Single Job Page */}
        <Route path="/jobs/:jobId" element={<JobDetails />} />

        {/* Companies */}
        <Route path="/companies" element={<Companies />} />

        {/* Company Profile View (Public) */}
        <Route path="/company-profile/:companyId" element={<CompanyProfileView />} />

        {/* Candidate Dashboard */}
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute role="candidate">
              <MyApplications />
            </ProtectedRoute>
          }
        />

        {/* Candidate Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute role="candidate">
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Employer Profile */}
        <Route
          path="/employer/profile"
          element={
            <ProtectedRoute role="employer">
              <EmployerProfile />
            </ProtectedRoute>
          }
        />

        {/* Post a Job (Employer Only) */}
        <Route
          path="/post-job"
          element={
            <ProtectedRoute role="employer">
              <PostJob />
            </ProtectedRoute>
          }
        />

        {/* Edit a Job (Employer Only) */}
        <Route
          path="/employer/edit-job/:jobId"
          element={
            <ProtectedRoute role="employer">
              <EditJob />
            </ProtectedRoute>
          }
        />

        {/* Employer Applicants */}
        <Route
          path="/employer-dashboard/applicants/:jobId"
          element={
            <ProtectedRoute role="employer">
              <Applicants />
            </ProtectedRoute>
          }
        />

        {/* Employer Dashboard */}
        <Route
          path="/employer-dashboard"
          element={
            <ProtectedRoute role="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="flex h-screen items-center justify-center text-2xl font-bold">
              Page Not Found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);