import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import type { User, AuthContextType, SignupData } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Session-only storage helpers ──────────────────────────────────
// Using sessionStorage so the session clears when the browser/tab is closed.
// This ensures the user is always on the landing page on a fresh start.
const store = {
  get: (key: string) => sessionStorage.getItem(key) || localStorage.getItem(key),
  set: (key: string, value: string) => sessionStorage.setItem(key, value),
  remove: (key: string) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from sessionStorage (cleared on browser close)
    const storedToken = store.get('token');
    const storedUser = store.get('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        store.remove('token');
        store.remove('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      setUser(newUser);
      store.set('token', newToken);
      store.set('user', JSON.stringify(newUser));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await api.post('/auth/signup', data);
      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      setUser(newUser);
      store.set('token', newToken);
      store.set('user', JSON.stringify(newUser));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Signup failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    store.remove('token');
    store.remove('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
