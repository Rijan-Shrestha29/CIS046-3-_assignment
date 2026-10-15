'use client';

// Auth context — a single source of truth for the current user.
// On mount it tries to restore the session by calling /api/auth/me,
// which succeeds if the httpOnly JWT cookie is still valid.
// Theme: Virtual Identity — the browser-side half.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);  // true while hydrating

  // Restore session on first render
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user } = await authApi.me();
        if (!cancelled) setUser(user);
      } catch {
        // Not logged in — that's fine
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (username, password) => {
    const { user } = await authApi.login(username, password);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (username, password) => {
    const { user } = await authApi.register(username, password);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}