import React from 'react';
import { User, Settings, CreditCard, HelpCircle, LogOut, ChevronRight, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLocalization();

  const menuItems = [
    { icon: Settings, label: 'Settings', color: 'bg-blue-100 text-blue-600' },
    { icon: CreditCard, label: 'Payment Methods', color: 'bg-emerald-100 text-emerald-600' },
    { icon: HelpCircle, label: 'Help & Support', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="container mx-auto px-4 pt-4 pb-24 animate-fade-in max-w-4xl">
      <div className="bg-white rounded-[3rem] p-8 border border-black/5 shadow-sm mb-8 relative overflow-hidden group">
        <div className="absolute top-[-20px] right-[-20px] opacity-5 text-primary pointer-events-none group-hover:scale-110 transition-transform duration-500">
          <User size={160} />
        </div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-2 mb-6 bg-white shadow-xl">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-300" />
              )}
            </div>
          </div>
          <h2 className="text-3xl font-black text-secondary tracking-tighter mb-1">{user?.name || 'Farmer Name'}</h2>
          <p className="text-xs text-primary font-bold uppercase tracking-[0.2em] mb-6">Verified Organic Producer</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-black/5">
              <MapPin size={16} className="text-gray-400 mb-2" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Location</span>
              <span className="text-xs font-black text-dark tracking-tight">Nashik, MH</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-black/5">
              <Phone size={16} className="text-gray-400 mb-2" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Phone</span>
              <span className="text-xs font-black text-dark tracking-tight">+91 98XXX XXX01</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-black/5">
              <Mail size={16} className="text-gray-400 mb-2" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Email</span>
              <span className="text-xs font-black text-dark tracking-tight">{user?.email || 'farmer@example.com'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {menuItems.map((item, index) => (
          <button key={index} className="w-full bg-white rounded-3xl p-6 border border-black/5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="text-lg font-black text-dark tracking-tight">{item.label}</span>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>

      <button 
        onClick={logout}
        className="w-full bg-red-50 text-red-600 rounded-3xl p-6 border border-red-100 shadow-sm hover:bg-red-100 transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm"
      >
        <LogOut size={20} />
        Log Out Account
      </button>
    </div>
  );
};

export default ProfilePage;
