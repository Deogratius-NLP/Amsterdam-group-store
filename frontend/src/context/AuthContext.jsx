import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('amsterdam_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('amsterdam_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyToken() {
      const storedToken = localStorage.getItem('amsterdam_admin_token');
      if (storedToken) {
        try {
          const profile = await adminService.getProfile();
          setAdminUser(profile);
          localStorage.setItem('amsterdam_admin_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    }
    verifyToken();
  }, []);

  const login = async (email, password) => {
    const data = await adminService.login(email, password);
    setToken(data.access_token);
    const userProfile = {
      id: data.user_id || 'admin',
      name: data.user_name,
      email: data.user_email,
      role: data.user_role
    };
    setAdminUser(userProfile);
    localStorage.setItem('amsterdam_admin_token', data.access_token);
    localStorage.setItem('amsterdam_admin_user', JSON.stringify(userProfile));
    return data;
  };

  const logout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('amsterdam_admin_token');
    localStorage.removeItem('amsterdam_admin_user');
  };

  return (
    <AuthContext.Provider value={{ adminUser, token, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
