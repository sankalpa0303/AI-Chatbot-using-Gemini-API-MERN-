import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'app_user';
const TOKEN_KEY = 'app_token';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('Auth load failed', err);
      return null;
    }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const persist = (next, token) => {
    setUser(next);
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (token) localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const register = async ({ name, email, password }) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Register failed');
    }
    const data = await res.json();
    persist(data.user, data.token);
    return data.user;
  };

  const login = async ({ email, password }) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    persist(data.user, data.token);
    return data.user;
  };

  const logout = () => persist(null);

  const updateUser = (partial) => {
    const next = { ...(user || {}), ...partial };
    const token = localStorage.getItem(TOKEN_KEY) || undefined;
    persist(next, token);
  };

  const requestPasswordReset = async (email) => {
    const res = await fetch(`${API_URL}/api/auth/reset/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Password reset request failed');
    }
    return data;
  };

  const confirmPasswordReset = async ({ email, token, password }) => {
    const res = await fetch(`${API_URL}/api/auth/reset/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Password reset failed');
    }
    if (data.user && data.token) {
      persist(data.user, data.token);
    }
    return data;
  };

  const token = localStorage.getItem(TOKEN_KEY) || undefined;

  return (
    <AuthContext.Provider value={{ user, token, ready, register, login, logout, updateUser, requestPasswordReset, confirmPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
