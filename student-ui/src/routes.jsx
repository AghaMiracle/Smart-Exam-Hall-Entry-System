import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import StudentLayout from './components/layout/StudentLayout';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import MyQRCode from './pages/MyQRCode';
import ExamHistory from './pages/ExamHistory';
import Profile from './pages/Profile';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes (No Signup) */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Student Console */}
      <Route element={<ProtectedRoute />}>
        <Route element={<StudentLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/my-qr" element={<MyQRCode />} />
          <Route path="/exam-history" element={<ExamHistory />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
