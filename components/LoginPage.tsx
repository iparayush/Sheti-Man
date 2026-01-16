import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { LeafIcon } from './icons';

const LoginPage: React.FC = () => {
  const { handleGoogleLogin } = useAuth();
  const { t } = useLocalization();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    const initializeGoogle = () => {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        setSdkLoaded(true);
        try {
          g.accounts.id.initialize({
            client_id: "741209341132-vm43hunjhpu4jorh7rt9ees47htfhrpj.apps.googleusercontent.com",
            callback: handleGoogleLogin,
            ux_mode: 'popup',             // Resilient to ancestry restrictions
            use_fedcm_for_prompt: false,  // CRITICAL: Bypasses FedCM same-origin ancestry errors
            itp_support: true,            // Intelligent Tracking Prevention support
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
                console.warn("[Auth] One Tap suppressed:", reason);
                // Auto-show help if the origin is clearly blocked by Google's policy
                if (reason === 'origin_mismatch' || reason === 'secure_context_required') {
                    setErrorVisible(true);
                }
             }
          });
          setIsInitializing(false);
        } catch (err) {
          console.error("[Auth] Initialization failed:", err);
          setErrorVisible(true);
        }
      }
    };

    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        initializeGoogle();
        clearInterval(interval);
      }
    }, 500);

    // Timeout if SDK fails to load (e.g., ad-blocker or CSP issue)
    const timeout = setTimeout(() => {
      if (!(window as any).google?.accounts?.id) {
        clearInterval(interval);
        setIsInitializing(false);
        setErrorVisible(true);
      }
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [handleGoogleLogin]);

  const copyOrigin = () => {
    const origin = window.location.origin;
    navigator.clipboard.writeText(origin).then(() => {
        alert(`URL Copied: ${origin}\n\nNow add this to your Google Cloud Console "Authorized JavaScript origins".`);
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
        
        <div className="w-full flex flex-col items-center justify-center min-h-[55px] mb-6">
          {isInitializing ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-gray-400 animate-pulse font-bold text-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                Authenticating...
              </div>
            </div>
          ) : (
            <div ref={googleBtnRef} className="animate-fade-in" />
          )}
        </div>

        <div className="w-full">
          <button 
            onClick={() => setErrorVisible(!errorVisible)}
            className={`text-[10px] font-black uppercase tracking-widest transition-all py-2.5 px-5 rounded-xl border ${errorVisible ? 'text-red-500 bg-red-50 border-red-100' : 'text-gray-300 border-transparent hover:text-primary hover:bg-primary/5'}`}
          >
            {errorVisible ? "Close Help Panel" : "Sign-in issues?"}
          </button>
          
          {errorVisible && (
            <div className="mt-5 p-6 bg-red-50 border border-red-100 rounded-[2rem] text-left animate-fade-in ring-8 ring-red-500/5">
              <p className="text-[11px] font-black text-red-700 uppercase mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                Whitelist Required
              </p>
              <p className="text-[11px] text-red-600 leading-tight mb-5 font-medium">
                Google blocks sign-in from this URL because it is not listed in your Authorized Origins.
              </p>
              
              <p className="text-[10px] font-bold text-red-800 mb-1.5 uppercase">1. Copy this Exact URL:</p>
              <div 
                onClick={copyOrigin}
                className="bg-white p-3.5 rounded-xl border border-red-200 font-mono text-[11px] break-all cursor-pointer hover:border-red-400 hover:shadow-md transition-all mb-6 flex items-center justify-between group"
              >
                <span className="truncate pr-4 font-bold text-red-900">{window.location.origin}</span>
                <span className="text-[9px] bg-red-600 text-white px-2.5 py-1 rounded-lg uppercase font-black shrink-0 group-active:scale-90 transition-transform">Copy</span>
              </div>

              <div className="space-y-3.5 text-[10px] text-red-700 font-bold">
                <div className="flex gap-3 items-start">
                  <span className="bg-red-200 text-red-700 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 font-black">2</span>
                  <span>Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline font-black text-red-900 hover:text-red-600">Google Cloud Credentials</a></span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-red-200 text-red-700 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 font-black">3</span>
                  <span>Select Client ID ending in <code className="bg-red-100 px-1 rounded text-red-900">...fhrpj</code></span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-red-200 text-red-700 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 font-black">4</span>
                  <span>Add the copied URL to <strong>Authorized JavaScript origins</strong> and Save.</span>
                </div>
              </div>
              <p className="mt-5 text-[9px] text-red-400 italic font-medium">Note: Changes take ~5 minutes to apply globally.</p>
            </div>
          )}
        </div>
        
        <div className="mt-10 pt-8 border-t border-gray-50 w-full">
          <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">
            Secure Organic Farming Portal
          </p>
          <p className="text-[10px] text-gray-300 font-medium">
            Authorized Personnel Only
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 font-medium max-w-xs leading-relaxed">
        By continuing, you agree to the Sheti Man AI Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default LoginPage;