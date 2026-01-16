
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
      // FIX: Using type casting to access 'google' on window
      const g = (window as any).google;
      if (g?.accounts?.id) {
        g.accounts.id.initialize({
          client_id: "847248316109-7757s8i7e0i0t7j6u1b9p5s4k2f3a6b.apps.googleusercontent.com",
          callback: handleGoogleLogin,
          use_fedcm_for_prompt: false, // Fix for FedCM permission issue
        });
        if (googleBtnRef.current) {
          g.accounts.id.renderButton(googleBtnRef.current, { theme: 'outline', size: 'large', shape: 'pill', width: 320 });
        }
      }
    };
    // FIX: Using type casting to access 'google' on window
    const checkGoogle = setInterval(() => { if ((window as any).google) { initializeGoogle(); clearInterval(checkGoogle); } }, 200);
    return () => clearInterval(checkGoogle);
  }, [handleGoogleLogin]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-50 max-w-sm w-full animate-slide-up">
        <div className="bg-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <LeafIcon className="w-14 h-14 text-primary" />
        </div>
        <h1 className="text-4xl font-black text-secondary tracking-tighter mb-2">{t('loginPage.title')}</h1>
        <p className="text-gray-500 font-bold mb-12">{t('loginPage.subtitle')}</p>
        <div className="flex justify-center" ref={googleBtnRef} />
      </div>
    </div>
  );
};

export default LoginPage;
