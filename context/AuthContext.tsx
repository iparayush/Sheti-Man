import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  handleGoogleLogin: (response: any) => void;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode JWT safely
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleGoogleLogin = (response: any) => {
    const decoded = parseJwt(response.credential);
    if (decoded) {
      const newUser: User = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        role: 'farmer',
      };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      name: 'Guest Farmer',
      email: 'guest@shetiman.ai',
      role: 'farmer',
    };
    localStorage.setItem('user', JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <AuthContext.Provider value={{ user, handleGoogleLogin, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};