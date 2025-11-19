// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import { API_BASE } from '../api/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { email, role }
  const [token, setToken] = useState(null); // JWT string

  const login = async (email, password = 'demo') => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      throw new Error('Login failed');
    }

    const data = await res.json();
    console.log('Login response:', data);

    // Support both possible backend shapes:
    // A) { token, user: { email, role } }
    // B) { token, email, role }
    let authUser;
    let authToken = data.token || null;

    if (data.user && typeof data.user === 'object') {
      authUser = {
        email: data.user.email,
        role: data.user.role || 'student',
      };
    } else {
      authUser = {
        email: data.email,
        role: data.role || 'student',
      };
    }

    setUser(authUser);
    setToken(authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
