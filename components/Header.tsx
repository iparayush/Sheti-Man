import React, { useState } from 'react';
import { ShetiManLogo, QRIcon, UserIcon, TrashIcon, ShoppingCartIcon } from './icons';
import { Page, Language } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onBack?: () => void;
  showBackButton?: boolean;
  navigateTo: (page: Page) => void;
  onQRCodeClick: () => void;
  cartCount: number;
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack, showBackButton, navigateTo, onQRCodeClick, cartCount, onCartClick }) => {
  const { t, language, setLanguage } = useLocalization();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language, name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
  ];

  return (
    <header className="bg-primary shadow-lg sticky top-0 z-40 rounded-b-2xl">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <button onClick={onBack} className="text-white mr-3 p-2 hover:bg-white/10 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigateTo(Page.DASHBOARD)}>
            <ShetiManLogo className="w-10 h-10" />
            <div>
              <h1 className="text-lg font-black text-white leading-none tracking-tight">Sheti Man</h1>
              <p className="text-[10px] font-bold text-white/80 uppercase tracking-tighter">{t('header.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={onQRCodeClick} className="text-white p-2 hover:bg-white/10 rounded-full transition-all">
            <QRIcon className="w-5 h-5" />
          </button>
          <button onClick={onCartClick} className="relative text-white p-2 hover:bg-white/10 rounded-full transition-all">
            <ShoppingCartIcon className="w-5 h-5" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartCount}</span>}
          </button>
          <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1 hover:bg-white/10 rounded-full transition-all flex items-center gap-1">
              {user?.picture ? <img src={user.picture} alt="" className="w-8 h-8 rounded-full border border-white/50" /> : <UserIcon className="w-8 h-8" />}
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in py-2">
                <div className="px-4 py-2 border-b">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('header.language')}</p>
                  <div className="space-y-1">
                    {languages.map(l => (
                      <button key={l.code} onClick={() => { setLanguage(l.code); setIsOpen(false); }} className={`w-full text-left px-2 py-1.5 rounded-lg text-sm font-bold ${language === l.code ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>{l.name}</button>
                    ))}
                  </div>
                </div>
                <button onClick={() => { logout(); setIsOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">{t('header.logout')}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;