import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { QrCode, Lock, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';

const resetSchema = zod.object({
  password: zod.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: zod.string().min(6, 'Confirm password is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const ResetPassword = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema)
  });

  const onSubmit = async (data) => {
    if (!token) {
      showToast('Invalid or missing reset token.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.auth.resetPassword(token, data.password);
      showToast('Password updated successfully! Please login.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Password reset failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-geo-dots flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
        <div className="w-full max-w-md relative z-10">
          <div className="flat-card bg-white text-center">
            <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-flatAmber" />
            <h2 className="text-2xl font-black uppercase tracking-wide mb-3 text-black">
              Invalid Reset Link
            </h2>
            <p className="text-sm font-bold text-gray-500 uppercase mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="flat-btn-blue justify-center text-xs font-black uppercase py-3 w-full"
            >
              Request New Link
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-geo-dots flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      <div className="geo-shape-circle w-80 h-80 -top-16 -left-16 opacity-35" />
      <div className="geo-shape-triangle bottom-10 right-10 opacity-30 rotate-45" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="flat-border p-4 bg-flatBlue text-white hover:scale-110 transition-transform duration-200">
            <QrCode className="w-12 h-12 stroke-[3]" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-wider mt-4 mb-1 text-black">SmartEntry</h1>
        </div>

        <div className="flat-card bg-white">
          <h2 className="text-2xl font-black uppercase tracking-wide mb-6 border-b-4 border-black pb-3 text-black">
            Set New Password
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                  <Lock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`flat-input pl-11 ${errors.password ? 'border-red-500 bg-red-50' : 'border-black'}`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-xs font-extrabold uppercase text-red-500 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                  <Lock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`flat-input pl-11 ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-black'}`}
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-xs font-extrabold uppercase text-red-500 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flat-btn-blue justify-center text-sm font-black uppercase py-4 mt-2"
            >
              {submitting ? 'Updating Password...' : 'Save New Password'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-4 border-black text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-black uppercase text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
