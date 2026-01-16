import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { LeafIcon, UserIcon } from './icons';

const LoginPage: React.FC = () => {
  const { handleGoogleLogin, loginAsGuest } = useAuth();
  const { t } = useLocalization();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    const initializeGoogle = () => {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        try {
          // Initialize with the provided Client ID
          g.accounts.id.initialize({
            client_id: "741209341132-vm43hunjhpu4jorh7rt9ees47htfhrpj.apps.googleusercontent.com",
            callback: handleGoogleLogin,
            ux_mode: 'popup',
            use_fedcm_for_prompt: false, 
            itp_support: true,
            auto_select: false,
          });

          if (googleBtnRef.current) {
            g.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'outline',
              size: 'large',
              shape: 'pill',
              width: 280,
              text: 'signin_with',
            });
          }
          
          g.accounts.id.prompt((notification: any) => {
             // Catching the origin_mismatch error that triggers the GSI_LOGGER warning
             if (notification.isNotDisplayed()) {
                const reason = notification.getNotDisplayedReason();
                console.warn("[Auth] Google Prompt Notification:", reason);
                
                if (reason === 'origin_mismatch' || reason === 'opt_out_or_no_session') {
                    setErrorStatus(reason);
                    setShowFallback(true);
                }
             }
          });
          setIsInitializing(false);
        } catch (err) {
          console.error("[Auth] Google SDK Error:", err);
          setErrorStatus('sdk_error');
          setShowFallback(true);
          setIsInitializing(false);
        }
      }
    };

    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        initializeGoogle();
        clearInterval(interval);
      }
    }, 500);

    const timeout = setTimeout(() => {
      if (isInitializing) {
        setShowFallback(true);
        setIsInitializing(false);
        clearInterval(interval);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [handleGoogleLogin, isInitializing]);

  const copyOrigin = () => {
    const origin = window.location.origin;
    navigator.clipboard.writeText(origin).then(() => {
        alert(`URL Copied: ${origin}\n\nPaste this into your Google Cloud Console under "Authorized JavaScript origins" for Client ID 741209341132-vm43hunjhpu4jorh7rt9ees47htfhrpj.`);
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[100px] animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="relative bg-white p-10 md:p-14 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-50 max-w-sm w-full animate-slide-up flex flex-col items-center z-10">
        <div className="bg-[#388E3C]/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-inner ring-8 ring-primary/5 group hover:scale-105 transition-transform duration-500">
          <LeafIcon className="w-14 h-14 text-[#388E3C]" />
        </div>
        
        <h1 className="text-4xl font-black text-[#1B5E20] tracking-tighter mb-2 leading-none">
          Sheti Man AI
        </h1>
        <p className="text-gray-400 font-bold mb-10 text-[10px] uppercase tracking-[0.3em] opacity-60">
          Sustainable Growth Partner
        </p>
        
        <div className="w-full flex flex-col items-center justify-center min-h-[60px] mb-2">
          {isInitializing ? (
            <div className="flex flex-col items-center gap-3">
               <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
               <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest animate-pulse tracking-tighter">Connecting to Portal</span>
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col items-center w-full">
               <div ref={googleBtnRef} className="min-h-[44px]" />
            </div>
          )}
        </div>

        {/* Origin Alert for Developers */}
        {errorStatus === 'origin_mismatch' && (
          <div className="w-full mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 text-left animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Setup Required</p>
            </div>
            <p className="text-[9px] text-red-600 leading-tight mb-3 font-medium">
              Google Login is blocked for this domain. You must add the current URL to your Google Cloud Console "Authorized origins".
            </p>
            <button 
              onClick={copyOrigin}
              className="w-full py-2 px-3 bg-white border border-red-200 rounded-xl text-[9px] font-mono text-center text-red-800 hover:bg-red-50 transition-colors"
            >
              Copy Origin: {window.location.origin}
            </button>
          </div>
        )}

        {/* Fallback & Guest Login */}
        {(showFallback || errorStatus) && (
          <div className="w-full mt-6 space-y-4 animate-fade-in">
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <button 
              onClick={loginAsGuest}
              className="w-full py-4 px-6 rounded-2xl bg-[#1B5E20] text-white font-black uppercase tracking-widest text-[11px] hover:bg-[#2E7D32] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95 group"
            >
              <UserIcon className="w-4 h-4 group-hover:animate-bounce" />
              Continue as Guest
            </button>
          </div>
        )}

        <div className="mt-14 pt-8 border-t border-gray-50 w-full opacity-40">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.5em] leading-none mb-1">
            Global Organic Standard
          </p>
        </div>
      </div>
      
      <p className="mt-10 text-[10px] text-gray-400 font-bold max-w-[280px] leading-relaxed opacity-40 uppercase tracking-[0.2em]">
        Designed for the modern eco-conscious farmer
      </p>
    </div>
  );
};

export default LoginPage;