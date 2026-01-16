
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const newUser: User = {
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Farmer',
          email: session.user.email || '',
          picture: session.user.user_metadata.avatar_url,
          phone: session.user.user_metadata.phone,
          role: 'farmer',
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        // If no session but local storage exists, it might be a guest or expired
        // Clear local storage if no Supabase session exists and it's not a guest
        const stored = localStorage.getItem('user');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.email !== 'guest@shetiman.ai' && !session) {
                setUser(null);
                localStorage.removeItem('user');
            }
        }
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const newUser: User = {
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Farmer',
          email: session.user.email || '',
          picture: session.user.user_metadata.avatar_url,
          phone: session.user.user_metadata.phone,
          role: 'farmer',
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginAsGuest = () => {
    const guestUser: User = {
      name: 'Guest Farmer',
      email: 'guest@shetiman.ai',
      role: 'farmer',
    };
    localStorage.setItem('user', JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
