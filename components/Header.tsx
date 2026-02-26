
import React, { useState } from 'react';
import { QrCode, User, ChevronLeft, Globe } from 'lucide-react';
import { AgriFertiLogo } from './icons';
import { Page, Language } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onBack?: () => void;
  showBackButton?: boolean;
  navigateTo: (page: Page) => void;
  onQRCodeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack, showBackButton, navigateTo, onQRCodeClick }) => {
  const { t, language, setLanguage } = useLocalization();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language, name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
  ];

  return (
    <header className="bg-secondary shadow-lg sticky top-0 z-40 rounded-b-[2rem]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <button onClick={onBack} className="text-white mr-3 p-2 hover:bg-white/10 rounded-xl transition-all">
              <ChevronLeft size={24} strokeWidth={3} />
            </button>
          )}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo(Page.DASHBOARD)}>
            <AgriFertiLogo className="w-10 h-10 drop-shadow-md" />
            <div>
              <h1 className="text-xl font-black text-white leading-none tracking-tighter">shetiman</h1>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{t('header.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={onQRCodeClick} className="text-white p-2.5 hover:bg-white/10 rounded-2xl transition-all">
            <QrCode size={20} />
          </button>
          <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1 hover:bg-white/10 rounded-2xl transition-all flex items-center gap-1">
              {user?.picture ? (
                <img src={user.picture} alt="" className="w-9 h-9 rounded-full border-2 border-white/20" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={20} />
                </div>
              )}
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-4 w-56 bg-white rounded-[2rem] shadow-2xl border border-black/5 overflow-hidden animate-fade-in py-3 z-50">
                <div className="px-6 py-3 border-b border-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe size={14} className="text-primary" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('header.language')}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {languages.map(l => (
                      <button 
                        key={l.code} 
                        onClick={() => { setLanguage(l.code); setIsOpen(false); }} 
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
                          language === l.code ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-2 pt-2">
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }} 
                    className="w-full text-left px-4 py-4 text-sm font-black text-red-500 hover:bg-red-50 rounded-2xl transition-all flex items-center gap-2"
                  >
                    <User size={16} />
                    {t('header.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
