import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-geo-dots flex flex-col items-center justify-center p-6">
        <div className="flat-card max-w-sm w-full bg-white flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-t-flatBlue border-black rounded-full animate-spin" />
          <h3 className="font-black text-xl">Loading Session...</h3>
          <p className="text-gray-600 font-bold text-sm">Validating security credentials</p>
        </div>
      </div>
    );
  }

  if (!user || !['institution_admin', 'exam_officer', 'super_admin'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
