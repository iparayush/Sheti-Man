import React from 'react';
import { Home, Sprout, ShoppingBag, User } from 'lucide-react';
import { Page } from '../types';

interface BottomNavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPage, onNavigate }) => {
  const tabs = [
    { id: Page.DASHBOARD, label: 'Home', icon: Home },
    { id: Page.MY_CROPS, label: 'Crops', icon: Sprout },
    { id: Page.MARKET_PRICES, label: 'Market', icon: ShoppingBag },
    { id: Page.PROFILE, label: 'Profile', icon: User },
  ];

  const isTabActive = (tabId: Page) => {
    if (tabId === Page.DASHBOARD) {
      return currentPage === Page.DASHBOARD;
    }
    return currentPage === tabId;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 px-6 py-3 flex justify-between items-center z-50 glass-effect">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isTabActive(tab.id);
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
              active ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-primary/10' : ''}`}>
              <Icon size={24} strokeWidth={active ? 3 : 2} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-0'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
