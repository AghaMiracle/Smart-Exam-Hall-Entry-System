import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { QrCode, Lock, Mail, Building, Phone, MapPin, User, ShieldAlert, ArrowRight } from 'lucide-react';

const signupSchema = zod.object({
  institutionName: zod.string().min(3, 'Institution name must be at least 3 characters'),
  firstName: zod.string().min(1, 'First name is required').max(100, 'First name must be under 100 characters'),
  lastName: zod.string().min(1, 'Last name is required').max(100, 'Last name must be under 100 characters'),
  email: zod.string().email('Please enter a valid email address'),
  phone: zod.string().min(8, 'Please enter a valid phone number'),
  address: zod.string().min(5, 'Please enter a valid street address'),
  password: zod
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: zod.string().min(8, 'Confirm password is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const Signup = () => {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await signup(data);
      showToast('Institution registered successfully!', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-geo-dots flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Decorative Geometric Accents */}
      <div className="geo-shape-circle w-80 h-80 -top-16 -left-16 opacity-35" />
      <div className="geo-shape-triangle bottom-10 right-10 opacity-30 rotate-45" />

      <div className="w-full max-w-xl relative z-10 py-8">
        {/* Portal Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="flat-border p-3 bg-flatBlue text-white hover:scale-110 transition-transform duration-200">
            <QrCode className="w-10 h-10 stroke-[3]" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider mt-3 mb-1 text-black">SmartEntry</h1>
          <span className="flat-border-sm bg-flatAmber text-black px-2.5 py-0.5 text-[10px] font-black uppercase">
            REGISTRATION GATEWAY
          </span>
        </div>

        {/* Signup Form Card */}
        <div className="flat-card bg-white">
          <h2 className="text-xl font-black uppercase tracking-wide mb-6 border-b-4 border-black pb-3 text-black">
            Register Institution
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Institution Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
                  Institution Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                    <Building className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Apex Technical University"
                    className={`flat-input pl-10 text-sm ${errors.institutionName ? 'border-red-500 bg-red-50' : 'border-black'}`}
                    {...register('institutionName')}
                  />
                </div>
                {errors.institutionName && (
                  <p className="mt-1.5 text-[10px] font-extrabold uppercase text-red-500 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {errors.institutionName.message}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
                  Admin First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                    <User className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    placeholder="John"
                    className={`flat-input pl-10 text-sm ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-black'}`}
                    {...register('firstName')}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1.5 text-[10px] font-extrabold uppercase text-red-500 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
                  Admin Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                    <User className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Doe"
                    className={`flat-input pl-10 text-sm ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-black'}`}
                    {...register('lastName')}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1.5 text-[10px] font-extrabold uppercase text-red-500 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                    <Mail className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <input
                    type="email"
                    placeholder="registrar@apex.edu"
                    className={`flat-input pl-10 text-sm ${errors.email ? 'border-red-500 bg-red-50' : 'border-black'}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-[10px] font-extrabold uppercase text-red-500 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
                  Contact Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                    <Phone className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    placeholder="+234 812 345 6789"
                    className={`flat-input pl-10 text-sm ${errors.phone ? 'border-red-500 bg-red-50' : 'border-black'}`}
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 text-[10px] font-extrabold uppercase text-red-500 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
                  Physical Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                    <MapPin className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    placeholder="12 University Road, Yaba, Lagos"
                    className={`flat-input pl-10 text-sm ${errors.address ? 'border-red-500 bg-red-50' : 'border-black'}`}
                    {...register('address')}
                  />
                </div>
                {errors.address && (
                  <p className="mt-1.5 text-[10px] font-extrabold uppercase text-red-500 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
                  Security Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                    <Lock className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={`flat-input pl-10 text-sm ${errors.password ? 'border-red-500 bg-red-50' : 'border-black'}`}
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-[10px] font-extrabold uppercase text-red-500 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                    <Lock className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={`flat-input pl-10 text-sm ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-black'}`}
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-[10px] font-extrabold uppercase text-red-500 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Hint */}
            <p className="text-[10px] font-bold text-gray-400 uppercase leading-normal">
              Password must be at least 8 characters with one uppercase letter, one lowercase letter, and one number.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flat-btn-blue justify-center text-sm font-black uppercase py-4 mt-2"
            >
              {submitting ? 'Creating Registry...' : 'Register Institution'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t-4 border-black text-center">
            <p className="text-xs font-bold text-gray-500 uppercase">
              Already registered?{' '}
              <Link to="/login" className="text-flatBlue font-black hover:underline ml-1">
                Access Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
