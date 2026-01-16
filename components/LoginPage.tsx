import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { LeafIcon } from './icons';

declare global {
  interface Window {
    google: any;
  }
}

const LoginPage: React.FC = () => {
  const { handleGoogleLogin } = useAuth();
  const { t } = useLocalization();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          // This should ideally be an environment variable
          client_id: "847248316109-7757s8i7e0i0t7j6u1b9p5s4k2f3a6b.apps.googleusercontent.com", // Placeholder
          callback: handleGoogleLogin,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            shape: 'pill',
            width: googleBtnRef.current.offsetWidth,
          });
        }

        window.google.accounts.id.prompt(); // Display One Tap prompt
      }
    };

    // Wait for script to load
    const timer = setInterval(() => {
      if (window.google) {
        initializeGoogleSignIn();
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [handleGoogleLogin]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white p-12 rounded-[2.5rem] shadow-2xl text-center border border-gray-50 flex flex-col items-center">
        <div className="bg-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <LeafIcon className="w-14 h-14 text-primary" />
        </div>
        <h1 className="text-5xl font-black text-secondary mb-4 tracking-tighter leading-none">
          {t('loginPage.title')}
        </h1>
        <p className="text-xl text-gray-500 font-bold mb-12 opacity-80">
          {t('loginPage.subtitle')}
        </p>
        
        <div className="w-full min-h-[50px] flex justify-center" ref={googleBtnRef}></div>
        
        <p className="mt-8 text-xs text-gray-400 font-medium">
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;