'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false); // ← prevent duplicate fetches

  const hydrateUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sb_token') : null;
    if (!token) { setLoading(false); return; }
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('sb_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only call the API once per app session, not on every render/navigation
    if (hasFetched.current) return;
    hasFetched.current = true;
    hydrateUser();
  }, [hydrateUser]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('sb_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    localStorage.setItem('sb_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('sb_token');
    setUser(null);
    hasFetched.current = false;
  };

  // Called explicitly after OAuth or profile update — forces a fresh fetch
  const refreshUser = useCallback(async () => {
    await hydrateUser();
  }, [hydrateUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};