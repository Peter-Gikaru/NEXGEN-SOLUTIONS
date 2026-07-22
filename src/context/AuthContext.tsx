import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  requiresPasswordChange?: boolean;
  defaultAddress?: string | null;
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  verify2FA: (email: string, code: string) => Promise<User>;
  googleLogin: (credential: string) => Promise<User>;
  facebookLogin: (accessToken: string) => Promise<User>;
  passkeyLoginAction: (userData: any) => void;
  register: (email: string, name: string, password: string, role?: string) => Promise<User>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data);
        localStorage.setItem('nexgen_was_logged_in', 'true');
      } catch (error) {
        setUser(null);
        if (localStorage.getItem('nexgen_was_logged_in') === 'true') {
          localStorage.removeItem('nexgen_was_logged_in');
          localStorage.removeItem('nexgen_cart');
          localStorage.removeItem('nexgen_session_id');
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);
  const login = async (email: string, password: string): Promise<any> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.requires2FA) {
        return response.data;
      }
      setUser(response.data);
      localStorage.setItem('nexgen_was_logged_in', 'true');
      return response.data;
    } catch (error: any) {
      setUser(null);
      let errMsg = error.response?.data?.message || 'Login failed';
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errMsg = error.response.data.errors.map((e: any) => e.message).join('. ');
      }
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };
  const googleLogin = async (credential: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/google', { credential });
      setUser(response.data);
      localStorage.setItem('nexgen_was_logged_in', 'true');
      return response.data;
    } catch (error: any) {
      setUser(null);
      throw new Error(error.response?.data?.message || 'Google Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const verify2FA = async (email: string, code: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login/verify-2fa', { email, code });
      setUser(response.data);
      localStorage.setItem('nexgen_was_logged_in', 'true');
      return response.data;
    } catch (error: any) {
      setUser(null);
      throw new Error(error.response?.data?.message || '2FA verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const facebookLogin = async (accessToken: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/facebook', { accessToken });
      setUser(response.data);
      localStorage.setItem('nexgen_was_logged_in', 'true');
      return response.data;
    } catch (error: any) {
      setUser(null);
      throw new Error(error.response?.data?.message || 'Facebook Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const passkeyLoginAction = (userData: any) => {
    setUser(userData);
    localStorage.setItem('nexgen_was_logged_in', 'true');
  };
  const register = async (email: string, name: string, password: string, role?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { email, name, password, role });
      setUser(response.data);
      localStorage.setItem('nexgen_was_logged_in', 'true');
      return response.data;
    } catch (error: any) {
      setUser(null);
      let errMsg = error.response?.data?.message || 'Registration failed';
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errMsg = error.response.data.errors.map((e: any) => e.message).join('. ');
      }
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
      setUser(null);
      localStorage.removeItem('nexgen_was_logged_in');
      localStorage.removeItem('nexgen_cart');
      localStorage.removeItem('nexgen_session_id');
      window.location.href = '/login';
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, verify2FA, googleLogin, facebookLogin, passkeyLoginAction, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
