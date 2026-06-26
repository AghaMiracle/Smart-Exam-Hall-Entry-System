import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Auth Pages (loaded eagerly — needed immediately)
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Pages (lazy-loaded — only when navigated to)
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Students = React.lazy(() => import('./pages/Students'));
const Exams = React.lazy(() => import('./pages/Exams'));
const QRManagement = React.lazy(() => import('./pages/QRManagement'));
const Scanner = React.lazy(() => import('./pages/Scanner'));
const Attendance = React.lazy(() => import('./pages/Attendance'));
const Reports = React.lazy(() => import('./pages/Reports'));
const AuditLogs = React.lazy(() => import('./pages/AuditLogs'));
const Settings = React.lazy(() => import('./pages/Settings'));

const PageLoader = () => (
  <div className="min-h-screen bg-geo-dots flex flex-col items-center justify-center p-6">
    <div className="flat-card max-w-sm w-full bg-white flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 border-4 border-t-flatBlue border-black rounded-full animate-spin" />
      <h3 className="font-black text-xl">Loading Page...</h3>
      <p className="text-gray-600 font-bold text-sm">Please wait</p>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Admin Console */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/qr-management" element={<QRManagement />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
