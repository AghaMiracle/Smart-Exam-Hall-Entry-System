import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const session = localStorage.getItem('student_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.student) {
          setUser(parsed.student);
          setInstitution(parsed.institution || null);
        }
      } catch (e) {
        localStorage.removeItem('student_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const session = await api.auth.login(username, password);
      setUser(session.student);
      setInstitution(session.institution || null);
      return session.student;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.auth.logout();
      setUser(null);
      setInstitution(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    if (!user) return;
    const updated = await api.profile.update(formData);
    // Merge updated fields into user state
    const newUser = { ...user, ...updated };
    setUser(newUser);

    // Update stored session
    const session = JSON.parse(localStorage.getItem('student_session'));
    if (session) {
      session.student = newUser;
      localStorage.setItem('student_session', JSON.stringify(session));
    }
    return newUser;
  };

  const value = {
    user,
    institution,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
