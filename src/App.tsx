import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CourseMarketplace from './pages/CourseMarketplace';
import CourseDetails from './pages/CourseDetails';
import DashboardLayout from './components/DashboardLayout';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TrainerDashboard from './pages/dashboard/TrainerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import MyCourses from './pages/dashboard/MyCourses';
import Assessments from './pages/dashboard/Assessments';
import SettingsPage from './pages/dashboard/SettingsPage';
import Certificates from './pages/dashboard/Certificates';
import Attendance from './pages/dashboard/Attendance';
import CreateCourse from './pages/dashboard/CreateCourse';
import ManageCourses from './pages/dashboard/ManageCourses';
import CreateAssessment from './pages/dashboard/CreateAssessment';
import GradeSubmissions from './pages/dashboard/GradeSubmissions';
import CoursePlayer from './pages/dashboard/CoursePlayer';
import AssessmentView from './pages/dashboard/AssessmentView';
import CertificateView from './pages/dashboard/CertificateView';
import ManageStudents from './pages/dashboard/ManageStudents';
import AdminUsers from './pages/dashboard/AdminUsers';
import AdminCourses from './pages/dashboard/AdminCourses';
import AdminFinances from './pages/dashboard/AdminFinances';
import AdminSettings from './pages/dashboard/AdminSettings';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CourseMarketplace />} />
          <Route path="/courses/:id" element={<CourseDetails />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="student" element={<StudentDashboard />} />
            <Route path="trainer" element={<TrainerDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            
            {/* Student Routes */}
            <Route path="student/my-courses" element={<MyCourses />} />
            <Route path="student/attendance" element={<Attendance />} />
            <Route path="student/assessments" element={<Assessments />} />
            <Route path="student/certificates" element={<Certificates />} />
            <Route path="student/certificate/:certificateId" element={<CertificateView />} />
            <Route path="student/course/:courseId/play" element={<CoursePlayer />} />
            <Route path="student/course/:courseId/assessment" element={<AssessmentView />} />
            <Route path="student/settings" element={<SettingsPage />} />

            {/* Trainer Routes */}
            <Route path="trainer/courses/create" element={<CreateCourse />} />
            <Route path="trainer/courses/manage" element={<ManageCourses />} />
            <Route path="trainer/assessments/create" element={<CreateAssessment />} />
            <Route path="trainer/assessments/grade" element={<GradeSubmissions />} />
            <Route path="trainer/students" element={<ManageStudents />} />
            <Route path="trainer/settings" element={<SettingsPage />} />
            
            {/* Admin Routes */}
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/courses" element={<AdminCourses />} />
            <Route path="admin/finances" element={<AdminFinances />} />
            <Route path="admin/settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
