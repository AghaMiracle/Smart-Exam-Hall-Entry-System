import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const session = localStorage.getItem('institution_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.user) {
          setUser(parsed.user);
          setInstitution(parsed.institution || null);
        }
      } catch (e) {
        localStorage.removeItem('institution_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const session = await api.auth.login(email, password);
      setUser(session.user);
      setInstitution(session.institution || null);
      return session.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    setLoading(true);
    try {
      const session = await api.auth.signup(formData);
      setUser(session.user);
      setInstitution(session.institution || null);
      return session;
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

  const value = {
    user,
    institution,
    loading,
    login,
    signup,
    logout,
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
