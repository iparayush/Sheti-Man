import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { LeafIcon } from './icons';

const LoginPage: React.FC = () => {
  const { handleGoogleLogin } = useAuth();
  const { t } = useLocalization();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogle = () => {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        try {
          g.accounts.id.initialize({
            // Your provided Google Client ID
            client_id: "741209341132-vm43hunjhpu4jorh7rt9ees47htfhrpj.apps.googleusercontent.com",
            callback: handleGoogleLogin,
            use_fedcm_for_prompt: false, // Prevents FedCM 'identity-credentials-get' errors
            auto_select: false,
            cancel_on_tap_outside: true,
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
          
          // Show One Tap prompt if possible
          g.accounts.id.prompt();
        } catch (err) {
          console.error("Google Sign-In initialization failed:", err);
        }
      }
    };

    // Poll until Google SDK is loaded
    const checkGoogle = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        initializeGoogle();
        clearInterval(checkGoogle);
      }
    }, 200);

    return () => clearInterval(checkGoogle);
  }, [handleGoogleLogin]);

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
        
        <div className="w-full flex justify-center min-h-[50px] transition-all" ref={googleBtnRef} />
        
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