
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { ShetiManLogo } from './icons';
import { supabase } from '../services/supabaseClient';

const LoginPage: React.FC = () => {
  const { t } = useLocalization();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'signup'>('login');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase not configured.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (view === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              name: name,
              phone: phone,
              full_name: name
            }
          }
        });
        if (signUpError) throw signUpError;
        alert("Success! Check your email to confirm.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        // The session is automatically persisted by Supabase client
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="relative bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white max-w-md w-full animate-slide-up z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-24 h-24 mb-6">
            <ShetiManLogo className="w-full h-full drop-shadow-xl" />
          </div>
          <h1 className="text-2xl font-black text-secondary tracking-tighter mb-1 uppercase">Sheti Man AI</h1>
          <p className="text-gray-400 font-bold text-[9px] uppercase tracking-[0.4em] opacity-60">Smart Farming Partner</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {view === 'signup' && (
            <>
              <input 
                type="text" 
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all font-bold text-sm"
                required
              />
              <input 
                type="tel" 
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all font-bold text-sm"
                required
              />
            </>
          )}
          <input 
            type="email" 
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all font-bold text-sm"
            required
          />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all font-bold text-sm pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.076L3.707 2.293zM8.305 5.264A6.859 6.859 0 0110 5c3.647 0 6.828 2.424 7.81 5.85a3.911 3.911 0 01-1.218 1.727L8.305 5.264zm6.061 9.625l-1.2-1.2a4.003 4.003 0 01-5.655-5.655l-1.2-1.2a6.001 6.001 0 008.055 8.055z" clipRule="evenodd" />
                  <path d="M12.428 10.843L10 8.414l-2.428 2.429 1.414 1.414L10 11.242l1.014 1.015 1.414-1.414z" />
                </svg>
              )}
            </button>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-secondary transition-all active:scale-95"
          >
            {loading ? "..." : (view === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="flex justify-center mt-6">
          <button 
            onClick={() => setView(view === 'login' ? 'signup' : 'login')}
            className="text-[10px] font-black text-primary/60 hover:text-primary transition-colors uppercase tracking-widest underline underline-offset-4"
          >
            {view === 'login' ? "New here? Sign Up" : "Back to Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
