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
          // Initialize with the SPECIFIC client ID provided by the user to fix the origin error
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
             // Diagnostic for GSI_LOGGER / origin_mismatch errors
             if (notification.isNotDisplayed()) {
                const reason = notification.getNotDisplayedReason();
                console.warn("[Auth] Google Notification Status:", reason);
                
                // If the origin isn't whitelisted, the prompt won't show
                if (reason === 'origin_mismatch' || reason === 'opt_out_or_no_session') {
                    setErrorStatus(reason);
                    setShowFallback(true);
                }
             }
          });
          setIsInitializing(false);
        } catch (err) {
          console.error("[Auth] Google SDK Init Failed:", err);
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

    // Watchdog: If button doesn't render within 3s, enable guest bypass
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
        alert(`Origin Copied: ${origin}\n\n1. Go to Google Cloud Console\n2. Open your OAuth 2.0 Client ID\n3. Add this URL to "Authorized JavaScript origins"\n4. Click Save and wait 5 minutes.`);
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      {/* Premium Animated Nature Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[90%] h-[90%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[70%] bg-secondary/10 rounded-full blur-[100px] animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="relative bg-white p-10 md:p-14 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-50 max-w-sm w-full animate-slide-up flex flex-col items-center z-10">
        <div className="bg-[#388E3C]/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-inner ring-8 ring-primary/5 group hover:rotate-6 transition-all duration-500">
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
               <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest animate-pulse">Syncing Services</span>
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col items-center w-full">
               <div ref={googleBtnRef} className="min-h-[44px]" />
               {errorStatus === 'origin_mismatch' && (
                  <div className="mt-4 flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <p className="text-[9px] text-red-600 font-black uppercase tracking-tight">
                      Domain Blocked by Google
                    </p>
                  </div>
               )}
            </div>
          )}
        </div>

        {/* Dynamic Fallback & Troubleshooter */}
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
              <UserIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Continue as Guest
            </button>

            {errorStatus === 'origin_mismatch' && (
              <div className="p-5 bg-orange-50 rounded-3xl border border-orange-100 text-left mt-8 ring-4 ring-orange-50/50">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                    <p className="text-[10px] font-black text-orange-700 uppercase tracking-wider">Whitelist Required</p>
                </div>
                <p className="text-[9px] text-orange-600 leading-relaxed mb-4 font-medium italic">
                  Google blocks logins until the domain is whitelisted in your Cloud Console.
                </p>
                <button 
                  onClick={copyOrigin}
                  className="w-full py-3.5 bg-white border-2 border-orange-200 rounded-2xl text-[10px] font-mono text-center text-orange-800 cursor-pointer hover:border-orange-400 hover:bg-orange-100 transition-all flex flex-col gap-1 shadow-sm group/btn"
                >
                  <span className="opacity-50 text-[7px] uppercase font-sans font-black tracking-tighter group-hover/btn:text-orange-900 transition-colors">Tap to copy your origin</span>
                  <span className="truncate px-3 font-bold">{window.location.origin}</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-14 pt-8 border-t border-gray-50 w-full opacity-40">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.5em] leading-none mb-1">
            Certified Organic AI
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