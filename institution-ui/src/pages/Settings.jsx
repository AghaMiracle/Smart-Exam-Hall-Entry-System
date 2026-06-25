import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { mockDb } from '../services/mockDataService';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Palette, 
  ShieldCheck, 
  Database,
  ArrowRight,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Security form state
  const [qrExpiration, setQrExpiration] = useState('30'); // in minutes
  const [secureKey, setSecureKey] = useState('0x7F2B9D9E11AC47E3');
  const [generatingKey, setGeneratingKey] = useState(false);

  // Sync token state
  const [copied, setCopied] = useState(false);
  const [importedToken, setImportedToken] = useState('');

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    try {
      const all = JSON.parse(localStorage.getItem('exam_hall_institutions')) || [];
      const idx = all.findIndex(i => i.id === user.id);
      if (idx !== -1) {
        all[idx].name = profileForm.name;
        all[idx].phone = profileForm.phone;
        all[idx].address = profileForm.address;
        localStorage.setItem('exam_hall_institutions', JSON.stringify(all));
        
        // update current user session
        const current = JSON.parse(localStorage.getItem('exam_hall_current_user'));
        current.user.name = profileForm.name;
        current.user.phone = profileForm.phone;
        current.user.address = profileForm.address;
        localStorage.setItem('exam_hall_current_user', JSON.stringify(current));

        mockDb.addAuditLog('Settings Update', 'Institution profile details updated', user.email);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      showToast('Profile update failed', 'error');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New passwords do not match", 'error');
      return;
    }

    try {
      const all = JSON.parse(localStorage.getItem('exam_hall_institutions')) || [];
      const idx = all.findIndex(i => i.id === user.id);
      if (idx !== -1) {
        if (all[idx].password !== passwordForm.oldPassword) {
          showToast('Incorrect old password', 'error');
          return;
        }
        all[idx].password = passwordForm.newPassword;
        localStorage.setItem('exam_hall_institutions', JSON.stringify(all));
        
        mockDb.addAuditLog('Settings Update', 'Institution password changed', user.email);
        showToast('Password changed successfully!', 'success');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showToast('Password change failed', 'error');
    }
  };

  const handleGenerateKey = () => {
    setGeneratingKey(true);
    setTimeout(() => {
      const randHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
      setSecureKey('0x' + randHex);
      setGeneratingKey(false);
      mockDb.addAuditLog('Settings Update', 'Rotated verification cryptographic keys', user.email);
      showToast('Cryptographic Verification Key rotated!', 'success');
    }, 600);
  };

  // Sync simulated DB token between student UI and institution UI
  const copySyncToken = () => {
    const data = mockDb.exportData();
    navigator.clipboard.writeText(data);
    setCopied(true);
    showToast('Database Sync Token copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportToken = (e) => {
    e.preventDefault();
    if (!importedToken) return;
    const ok = mockDb.importData(importedToken);
    if (ok) {
      showToast('Datastore synchronized successfully! Reloading...', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      showToast('Invalid Datastore Sync Token.', 'error');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Institution Profile', icon: <User className="w-4 h-4" /> },
    { id: 'password', name: 'Change Password', icon: <Lock className="w-4 h-4" /> },
    { id: 'theme', name: 'System Security', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'sync', name: 'Local Database Sync', icon: <Database className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-black m-0 tracking-wide">Settings</h1>
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">Configure profile details, security levels, and database scopes.</p>
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
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase border-b-4 border-black pb-3 text-black">
                Edit Institution Info
              </h2>

              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Institution Name</label>
                  <input 
                    type="text" 
                    className="flat-input text-sm py-2" 
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Email Address</label>
                    <input 
                      type="email" 
                      className="flat-input text-sm py-2 bg-gray-50 text-gray-400" 
                      value={user?.email} 
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Phone Number</label>
                    <input 
                      type="text" 
                      className="flat-input text-sm py-2" 
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Address</label>
                  <input 
                    type="text" 
                    className="flat-input text-sm py-2" 
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="flat-btn-blue text-xs font-black py-3 px-6 uppercase mt-2">
                  Update Profile Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase border-b-4 border-black pb-3 text-black">
                Update Security Password
              </h2>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="flat-input text-sm py-2"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="flat-input text-sm py-2"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="flat-input text-sm py-2"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="flat-btn-blue text-xs font-black py-3 px-6 uppercase mt-2">
                  Update Security Password
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* SYSTEM SECURITY TAB */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase border-b-4 border-black pb-3 text-black">
                Security Configurations
              </h2>

              <div className="space-y-6 max-w-xl">
                {/* QR Expiration */}
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-black">QR Token Lifetime (minutes)</label>
                  <select 
                    className="flat-select text-sm py-2"
                    value={qrExpiration}
                    onChange={(e) => {
                      setQrExpiration(e.target.value);
                      showToast(`Token expiration adjusted to ${e.target.value} minutes`, 'success');
                    }}
                  >
                    <option value="5">5 Minutes (Highly Secure)</option>
                    <option value="15">15 Minutes (Standard)</option>
                    <option value="30">30 Minutes (Convenient)</option>
                    <option value="60">60 Minutes (Developer Demo)</option>
                  </select>
                  <p className="text-[10px] font-bold text-gray-500 uppercase leading-snug">
                    Attendance scanners reject codes generated older than this threshold to prevent pass sharing.
                  </p>
                </div>

                {/* Crypto rotation */}
                <div className="space-y-2 pt-4 border-t-2 border-black">
                  <label className="block text-xs font-black uppercase tracking-wider text-black">Active Encryption Key</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flat-input text-sm py-2 font-mono bg-gray-50 text-gray-600 border-black" 
                      value={secureKey} 
                      disabled 
                    />
                    <button
                      onClick={handleGenerateKey}
                      disabled={generatingKey}
                      className="flat-btn bg-black text-white hover:scale-102 py-2 px-4 text-xs font-black uppercase shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-4 h-4 ${generatingKey ? 'animate-spin' : ''}`} />
                      Rotate
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase leading-snug">
                    Rotates verification keys. Active student passes will invalidate immediately upon rotating keys.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* LOCAL STORAGE DATABASE SYNC TAB */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase border-b-4 border-black pb-3 text-black">
                Simulated Database Sync
              </h2>
              
              <div className="space-y-6">
                <div className="flat-border bg-blue-50 border-black p-4 text-left">
                  <h4 className="font-black text-xs uppercase text-black mb-1">Dual-Origin Context</h4>
                  <p className="text-[10px] font-bold text-gray-500 leading-snug">
                    Because this project spawns two independent browser applications running on different ports, their browser localStorages are fully isolated.
                    To sync newly created students and courses from the Institution portal over to the Student portal, copy this sync token and paste it in the Student Portal's sync page!
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-xs uppercase text-black">1. Export Sync Token</h4>
                  <button
                    onClick={copySyncToken}
                    className="flat-btn bg-white hover:scale-102 flex items-center gap-2 py-2.5 px-6 text-xs font-black uppercase cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-flatEmerald" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied Token!' : 'Copy Database State'}
                  </button>
                </div>

                <form onSubmit={handleImportToken} className="space-y-3 pt-4 border-t-2 border-black max-w-xl">
                  <h4 className="font-black text-xs uppercase text-black">2. Import Sync Token</h4>
                  <textarea
                    rows={3}
                    placeholder="Paste database sync token here..."
                    className="flat-input text-xs font-mono p-3 w-full"
                    value={importedToken}
                    onChange={(e) => setImportedToken(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="flat-btn bg-black text-white hover:scale-102 py-2 px-6 text-xs font-black uppercase cursor-pointer"
                  >
                    Import Database State
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
