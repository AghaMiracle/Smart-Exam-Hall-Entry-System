import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { 
  User, 
  Lock, 
  ArrowRight,
  Camera
} from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('info');
  
  // profile editor states
  const [profileForm, setProfileForm] = useState({
    phone: user?.phone || '',
    email: user?.email || '',
  });

  // password editor states
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateProfile({
        phone: profileForm.phone,
        email: profileForm.email,
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Profile update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Passwords do not match", 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("New password must be at least 6 characters", 'error');
      return;
    }

    setSubmitting(true);
    try {
      // For password change, we'd need a dedicated endpoint
      // For now, show a message about contacting admin
      showToast('To change your password, please use the "Forgot Password" flow from the login page.', 'info');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message || 'Password update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be smaller than 5MB', 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      const result = await api.profile.uploadPassport(file);
      // Update the user in context
      await updateProfile({ passportPhoto: result?.passportPhoto });
      showToast('Passport photo uploaded successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Photo upload failed', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const tabs = [
    { id: 'info', name: 'Student Profile', icon: <User className="w-4 h-4" /> },
    { id: 'password', name: 'Change Password', icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-black m-0 tracking-wide">My Profile</h1>
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">View and update your personal details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Navigation Tabs */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-3 px-4 py-3 text-left font-black uppercase text-xs tracking-wider border-2 transition-all hover:scale-102 cursor-pointer ${
                activeTab === t.id 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-transparent hover:border-black'
              }`}
            >
              {t.icon}
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Right Side: Tab Panel Contents */}
        <div className="lg:col-span-3 flat-card bg-white">
          
          {/* PROFILE INFO TAB */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase border-b-4 border-black pb-3 text-black">
                Personal Information
              </h2>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6 pb-6 border-b-2 border-dashed border-gray-300">
                {/* Photo with upload */}
                <div className="relative group shrink-0">
                  {user?.passportPhoto ? (
                    <img
                      src={user.passportPhoto.startsWith('/uploads') 
                        ? `http://localhost:5000${user.passportPhoto}` 
                        : user.passportPhoto}
                      alt="Student Profile"
                      className="w-24 h-24 border-4 border-black object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 border-4 border-black bg-gray-100 flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                    />
                  </label>
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-t-flatBlue border-black rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-center md:text-left font-semibold text-xs text-gray-600">
                  <h3 className="text-xl font-black text-black uppercase">
                    {user?.lastName}, {user?.firstName}
                  </h3>
                  <div className="flex justify-center md:justify-start gap-1 mt-1">
                    <span className="flat-badge bg-gray-50 text-[10px] py-0.5 px-2 border-black font-black uppercase">
                      MATRIC: {user?.matricNumber}
                    </span>
                  </div>
                  <p className="pt-2">USERNAME: <span className="font-extrabold text-black uppercase">{user?.username}</span></p>
                  <p>DEPARTMENT: <span className="font-extrabold text-black uppercase">{user?.department}</span></p>
                  <p>FACULTY: <span className="font-extrabold text-black uppercase">{user?.faculty}</span></p>
                  <p>ACADEMIC LEVEL: <span className="font-extrabold text-black uppercase">{user?.level}</span></p>
                </div>
              </div>

              {/* Form editing contacts */}
              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
                <h4 className="font-black text-xs uppercase text-black">Update Contact Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Email</label>
                    <input 
                      type="email" 
                      className="flat-input text-sm py-2" 
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Phone</label>
                    <input 
                      type="text" 
                      className="flat-input text-sm py-2" 
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flat-btn-blue text-xs font-black py-3 px-6 uppercase mt-2"
                >
                  {submitting ? 'Saving...' : 'Update Contact Details'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase border-b-4 border-black pb-3 text-black">
                Change Password
              </h2>

              <div className="flat-border bg-blue-50 border-black p-4 text-left mb-4">
                <h4 className="font-black text-xs uppercase text-black mb-1">Password Reset</h4>
                <p className="text-[10px] font-bold text-gray-500 leading-snug uppercase">
                  For security, password changes are handled via the forgot password flow. Click the button below to initiate a password reset via your registered email.
                </p>
              </div>

              <a
                href="/forgot-password"
                className="flat-btn-blue text-xs font-black py-3 px-6 uppercase inline-flex items-center gap-2"
              >
                Go to Password Reset
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
