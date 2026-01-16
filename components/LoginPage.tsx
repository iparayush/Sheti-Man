import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { LeafIcon, GoogleIcon } from './icons';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLocalization();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white p-12 rounded-[2.5rem] shadow-2xl text-center border border-gray-50">
        <div className="bg-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <LeafIcon className="w-14 h-14 text-primary" />
        </div>
        <h1 className="text-5xl font-black text-secondary mb-4 tracking-tighter leading-none">{t('loginPage.title')}</h1>
        <p className="text-xl text-gray-500 font-bold mb-12 opacity-80">{t('loginPage.subtitle')}</p>
        <button 
          onClick={() => login('farmer')}
          className="w-full flex items-center justify-center gap-4 bg-primary text-white py-5 px-8 rounded-2xl font-black text-xl hover:bg-green-700 transition-all shadow-xl shadow-primary/20 active:scale-95"
        >
          <div className="bg-white rounded-full p-1.5 shadow-sm">
            <GoogleIcon className="w-6 h-6" />
          </div>
          <span>{t('loginPage.loginButton')}</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;