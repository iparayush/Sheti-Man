import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { LeafIcon, UserIcon } from './icons';

const LoginPage: React.FC = () => {
  const { handleGoogleLogin, loginAsGuest } = useAuth();
  const { t } = useLocalization();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  
  // State to manage visibility of fallbacks
  const [showFallbacks, setShowFallbacks] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeGoogle = () => {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        try {
          g.accounts.id.initialize({
            client_id: "741209341132-vm43hunjhpu4jorh7rt9ees47htfhrpj.apps.googleusercontent.com",
            callback: handleGoogleLogin,
            ux_mode: 'popup',
            use_fedcm_for_prompt: false, // Prevents "ancestry" origin errors on Netlify/Vercel
            itp_support: true,
            auto_select: false,
          });

          if (googleBtnRef.current) {
            g.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'outline',
              size: 'large',
              shape: 'pill',
              width: 320,
              text: 'signin_with',
            });
          }
          
          g.accounts.id.prompt((notification: any) => {
             if (notification.isNotDisplayed()) {
                const reason = notification.getNotDisplayedReason();
                console.warn("[Auth] Prompt not displayed:", reason);
                // If it's an origin mismatch, we show the troubleshooting UI
                if (reason === 'origin_mismatch') {
                    setErrorDetails("origin_mismatch");
                    setShowFallbacks(true);
                }
             }
          });
          setIsInitializing(false);
        } catch (err) {
          console.error("[Auth] Init Error:", err);
          setShowFallbacks(true);
          setIsInitializing(false);
        }
      }
    };

    // Check for Google SDK
    const checkInterval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        initializeGoogle();
        clearInterval(checkInterval);
      }
    }, 500);

    // If button doesn't appear after 5s, something is likely blocked (AdBlock or Origin)
    const timeout = setTimeout(() => {
      if (isInitializing) {
        setShowFallbacks(true);
        setIsInitializing(false);
        clearInterval(checkInterval);
      }
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [handleGoogleLogin, isInitializing]);

  const copyOrigin = () => {
    const origin = window.location.origin;
    navigator.clipboard.writeText(origin).then(() => {
        alert(`URL Copied: ${origin}\n\nPlease whitelist this in Google Cloud Console.`);
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl border border-gray-50 max-w-sm w-full animate-slide-up flex flex-col items-center">
        <div className="bg-[#388E3C]/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
          <LeafIcon className="w-14 h-14 text-[#388E3C]" />
        </div>
        
        <h1 className="text-4xl font-black text-[#1B5E20] tracking-tighter mb-3 leading-none">
          {t('loginPage.title')}
        </h1>
        <p className="text-gray-500 font-bold mb-12 text-lg leading-tight opacity-80">
          {t('loginPage.subtitle')}
        </p>
        
        <div className="w-full flex flex-col items-center justify-center min-h-[55px]">
          {isInitializing ? (
            <div className="flex items-center gap-2 text-gray-300 animate-pulse font-bold text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              Loading Security...
            </div>
          ) : (
            <div ref={googleBtnRef} className="animate-fade-in" />
          )}
        </div>

        {/* Fallback & Diagnostic Section - Hidden by default unless error detected */}
        {showFallbacks && (
          <div className="mt-8 w-full animate-fade-in">
            <button 
              onClick={loginAsGuest}
              className="w-full py-4 px-6 rounded-2xl border-2 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 transition-all flex items-center justify-center gap-2 mb-4"
            >
              <UserIcon className="w-4 h-4" />
              Access as Guest
            </button>

            <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-left">
              <p className="text-[10px] font-black text-red-700 uppercase mb-2">Setup Required:</p>
              <p className="text-[9px] text-red-600 leading-tight mb-4">
                Google blocked this request. Add your URL to "Authorized origins" in Google Cloud Console.
              </p>
              <div 
                onClick={copyOrigin}
                className="bg-white p-3 rounded-lg border border-red-200 font-mono text-[10px] cursor-pointer flex justify-between items-center"
              >
                <span className="truncate opacity-70">{window.location.origin}</span>
                <span className="text-[8px] font-black text-red-600 ml-2">COPY</span>
              </div>
            </div>
          </div>
        )}
        
        {!showFallbacks && (
            <button 
                onClick={() => setShowFallbacks(true)}
                className="mt-8 text-[9px] text-gray-200 hover:text-gray-400 font-black uppercase tracking-[0.2em] transition-colors"
            >
                Trouble Signing In?
            </button>
        )}

        <div className="mt-12 pt-8 border-t border-gray-50 w-full opacity-30">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">
            Authorized Personnel Only
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 font-medium max-w-xs leading-relaxed opacity-60">
        By continuing, you agree to the Sheti Man AI Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default LoginPage;