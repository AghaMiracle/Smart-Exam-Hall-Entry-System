import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import StudentLayout from './components/layout/StudentLayout';

// Auth Pages (loaded eagerly — needed immediately)
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Pages (lazy-loaded — only when navigated to)
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const MyQRCode = React.lazy(() => import('./pages/MyQRCode'));
const ExamHistory = React.lazy(() => import('./pages/ExamHistory'));
const Profile = React.lazy(() => import('./pages/Profile'));

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
    </Suspense>
  );
};

export default AppRoutes;
