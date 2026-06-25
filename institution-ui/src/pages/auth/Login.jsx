import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { QrCode, Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';

const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(8, 'Password must be at least 8 characters long'),
});

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      showToast('Logged in successfully', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Invalid email or password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-geo-dots flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Decorative Geometric Accents */}
      <div className="geo-shape-circle w-80 h-80 -top-16 -left-16 opacity-35" />
      <div className="geo-shape-triangle bottom-10 right-10 opacity-30 rotate-45" />

      <div className="w-full max-w-md relative z-10">
        {/* Portal Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="flat-border p-4 bg-flatBlue text-white hover:scale-110 transition-transform duration-200">
            <QrCode className="w-12 h-12 stroke-[3]" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-wider mt-4 mb-1 text-black">SmartEntry</h1>
          <span className="flat-border-sm bg-flatAmber text-black px-3 py-1 text-xs font-black uppercase">
            INSTITUTION PORTAL
          </span>
        </div>

        {/* Login Card Form */}
        <div className="flat-card bg-white">
          <h2 className="text-2xl font-black uppercase tracking-wide mb-6 border-b-4 border-black pb-3 text-black">
            Sign In
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                  <Mail className="w-5 h-5 stroke-[2.5]" />
                </div>
                <input
                  type="email"
                  placeholder="admin@institution.edu"
                  autoComplete="email"
                  className={`flat-input pl-11 ${errors.email ? 'border-red-500 bg-red-50' : 'border-black'}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-xs font-extrabold uppercase text-red-500 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-black">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-black uppercase text-flatBlue hover:underline tracking-wide"
                >
                  Forgot Password?
                </Link>
              </div>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flat-btn-blue justify-center text-sm font-black uppercase py-4"
            >
              {submitting ? 'Authenticating...' : 'Access Portal'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 pt-6 border-t-4 border-black text-center">
            <p className="text-xs font-bold text-gray-500 uppercase">
              New Institution?{' '}
              <Link to="/signup" className="text-flatBlue font-black hover:underline ml-1">
                Register Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
