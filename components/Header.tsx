import React, { useState } from 'react';
import { ShetiManLogo, QRIcon, UserIcon, TrashIcon } from './icons';
import { Page, Language } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';

const UserMenu: React.FC = () => {
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);

    const languages: { code: Language, name: string }[] = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'mr', name: 'मराठी' },
    ];

    const selectLanguage = (langCode: Language) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    const resetApp = () => {
        if (window.confirm(t('header.resetConfirm'))) {
            localStorage.clear();
            window.location.reload();
        }
    };

    if (!user) return null;

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="text-white p-1 rounded-full hover:bg-white/10 flex items-center gap-2 transition-all border border-transparent hover:border-white/20"
            >
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-white/50" />
                ) : (
                  <UserIcon className="w-8 h-8 text-white" />
                )}
                <span className="hidden sm:block font-bold text-sm tracking-tight text-white pr-2">{user.name}</span>
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 overflow-hidden animate-fade-in"
                >
                    <div className="px-4 py-3 border-b bg-gray-50/50 flex items-center gap-3">
                        {user.picture && <img src={user.picture} alt="" className="w-10 h-10 rounded-full border border-gray-200" />}
                        <div className="min-w-0">
                            <p className="text-sm text-dark font-extrabold truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="py-2">
                        <p className="px-4 pt-1 pb-1 text-[11px] uppercase font-black text-gray-400 tracking-widest">{t('header.language')}</p>
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => selectLanguage(lang.code)}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${language === lang.code ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                    <div className="py-2 border-t">
                        <button
                            onClick={resetApp}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            {t('header.resetApp')}
                        </button>
                        <button
                            onClick={logout}
                            className={`w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors`}
                        >
                            {t('header.logout')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface HeaderProps {
    onBack?: () => void;
    showBackButton?: boolean;
    navigateTo?: (page: Page) => void;
    onQRCodeClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack, showBackButton, navigateTo, onQRCodeClick }) => {
  const { t } = useLocalization();
  const { user } = useAuth();

  return (
    <header className="bg-[#388E3C] shadow-md sticky top-0 z-40 rounded-b-[1.25rem]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && onBack && (
            <button onClick={onBack} className="text-white mr-3 p-2 rounded-xl hover:bg-white/10 transition-all active:scale-90">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => user?.role === 'farmer' && navigateTo && navigateTo(Page.DASHBOARD)}>
            <div className="w-12 h-12 transition-transform group-hover:scale-105">
                <ShetiManLogo />
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-none tracking-tighter">Sheti Man</h1>
              <p className="text-[11px] font-bold text-[#E8F5E9] mt-1 tracking-tight uppercase opacity-90">{t('header.subtitle')}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {user?.role === 'farmer' && navigateTo && (
            <>
              {onQRCodeClick && (
                <button onClick={onQRCodeClick} className="text-white p-2 rounded-full hover:bg-white/10 transition-all active:scale-90 opacity-80 hover:opacity-100">
                  <QRIcon className="w-5 h-5 text-white" />
                </button>
              )}
            </>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;