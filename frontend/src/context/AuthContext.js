import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'app_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (err) {
      console.warn('Auth load failed', err);
    }
  }, []);

  const persist = (next) => {
    setUser(next);
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const register = async ({ name, email }) => {
    persist({ name, email });
    return { name, email };
  };

  const login = async ({ email }) => {
    // Demo-only: accept any email/password
    persist({ name: user?.name || email.split('@')[0], email });
    return { name: user?.name || email.split('@')[0], email };
  };

  const logout = () => persist(null);

  const updateUser = (partial) => {
    persist({ ...(user || {}), ...partial });
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
