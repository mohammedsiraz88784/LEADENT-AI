import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalInitialMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  loginDemo: () => Promise<void>;
  loginWithGoogle: (params: { credential?: string; accessToken?: string }) => Promise<{ user: User; isNew?: boolean }>;
  loginWithEmail: (email: string, name?: string) => Promise<void>;
  loginWithCredentials: (email: string, password?: string) => Promise<void>;
  verifyOtpAndLogin: (email: string, otp: string, purpose?: 'registration' | 'login' | 'verification') => Promise<User | undefined>;
  setUser: (user: User | null) => void;
  register: (params: {
    name: string;
    email: string;
    password?: string;
    semester?: string;
    college?: string;
    otp?: string;
  }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalInitialMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('leadent_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.auth.getMe();
        if (res.user) {
          setUser(res.user);
        } else {
          localStorage.removeItem('leadent_token');
          setUser(null);
        }
      } catch {
        localStorage.removeItem('leadent_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const loginDemo = async () => {
    setLoading(true);
    try {
      const res = await api.auth.loginDemo();
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (params: { credential?: string; accessToken?: string }) => {
    setLoading(true);
    try {
      const res = await api.auth.loginWithGoogle(params);
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, name?: string) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, undefined, name);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const loginWithCredentials = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndLogin = async (
    email: string,
    otp: string,
    purpose: 'registration' | 'login' | 'verification' = 'verification'
  ): Promise<User | undefined> => {
    setLoading(true);
    try {
      const res = await api.auth.verifyOtp(email, otp, purpose);
      if (res.user) {
        setUser(res.user);
        return res.user;
      }
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const register = async (params: {
    name: string;
    email: string;
    password?: string;
    semester?: string;
    college?: string;
    otp?: string;
  }): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.auth.register(params);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authModalOpen,
        authModalInitialMode,
        openAuthModal,
        closeAuthModal,
        loginDemo,
        loginWithGoogle,
        loginWithEmail,
        loginWithCredentials,
        verifyOtpAndLogin,
        setUser,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
