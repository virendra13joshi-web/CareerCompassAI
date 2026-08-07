import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import EligibilityChecker from './pages/EligibilityChecker';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import CareerChat from './pages/CareerChat';
import InterviewExperiences from './pages/InterviewExperiences';
import ExperienceDetail from './pages/ExperienceDetail';
import PreparationRoadmap from './pages/PreparationRoadmap';
import PlacementAnalytics from './pages/PlacementAnalytics';
import NotificationsPage from './pages/NotificationsPage';

// Admin Pages
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import StudentManagement from './pages/Admin/StudentManagement';
import CompanyManagement from './pages/Admin/CompanyManagement';
import ResumeReports from './pages/Admin/ResumeReports';
import InterviewExperiencesAdmin from './pages/Admin/InterviewExperiencesAdmin';
import RoadmapsAdmin from './pages/Admin/RoadmapsAdmin';
import NotificationsAdmin from './pages/Admin/NotificationsAdmin';
import AnalyticsAdmin from './pages/Admin/AnalyticsAdmin';
import UserManagement from './pages/Admin/UserManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ─── Public / Student Routes (with Navbar) ─── */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/verify-email/:token" element={<VerifyEmail />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/companies/:id" element={<CompanyDetails />} />
                    <Route path="/eligibility" element={<EligibilityChecker />} />
                    <Route path="/interview-experiences" element={<InterviewExperiences />} />
                    <Route path="/interview-experiences/:id" element={<ExperienceDetail />} />
                    <Route path="/analytics" element={<PlacementAnalytics />} />

                    {/* Protected Student Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                    <Route path="/career-chat" element={<ProtectedRoute><CareerChat /></ProtectedRoute>} />
                    <Route path="/roadmap" element={<ProtectedRoute><PreparationRoadmap /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  </Routes>
                </main>
              </div>
            }
          />

          {/* ─── Admin Routes (no Navbar, full dark layout) ─── */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="companies" element={<CompanyManagement />} />
              <Route path="reports" element={<ResumeReports />} />
              <Route path="experiences" element={<InterviewExperiencesAdmin />} />
              <Route path="roadmaps" element={<RoadmapsAdmin />} />
              <Route path="notifications" element={<NotificationsAdmin />} />
              <Route path="analytics" element={<AnalyticsAdmin />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
