import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { QrCode, Mail, ShieldAlert, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const forgotSchema = zod.object({
  email: zod.string().email('Please enter a valid email address')
});

export const ForgotPassword = () => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.auth.forgotPassword(data.email);
      setTargetEmail(data.email);
      setSent(true);
      showToast('Simulated reset password token sent successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Email not found', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
          {!sent ? (
            <>
              <h2 className="text-2xl font-black uppercase tracking-wide mb-3 text-black">
                Forgot Password
              </h2>
              <p className="text-sm font-bold text-gray-500 mb-6 uppercase leading-tight">
                Enter your registered email below, and we will send a password reset link.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flat-btn-blue justify-center text-sm font-black uppercase py-4"
                >
                  {submitting ? 'Sending Request...' : 'Send Reset Link'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-flatEmerald text-white flat-border mx-auto flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wide mb-3 text-black">
                Request Dispatched
              </h2>
              <p className="text-sm font-bold text-gray-600 uppercase leading-relaxed mb-6">
                A password reset token has been simulated for <span className="text-flatBlue font-black">{targetEmail}</span>.
              </p>
              
              <div className="flat-border bg-gray-50 p-4 mb-6 text-left">
                <h4 className="font-black text-xs uppercase text-black mb-1">Simulation Mode Note</h4>
                <p className="text-xs font-bold text-gray-500 leading-snug">
                  You can now go to the Reset Password page to configure a new password for this email directly.
                </p>
              </div>

              <Link
                to={`/reset-password?email=${encodeURIComponent(targetEmail)}`}
                className="w-full flat-btn-blue justify-center text-xs font-black uppercase py-3 mb-3"
              >
                Go to Reset Password
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

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

export default ForgotPassword;
