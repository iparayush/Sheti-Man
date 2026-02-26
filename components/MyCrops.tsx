import React from 'react';
import { Sprout, Plus, ChevronRight, AlertCircle } from 'lucide-react';
import { ExpertAdvice } from './DesignSystem';

const MyCrops: React.FC = () => {
  const crops = [
    { name: 'Organic Onions', variety: 'Red Creole', status: 'Healthy', health: 95, lastCheck: '2 days ago' },
    { name: 'Basmati Rice', variety: 'Pusa 1121', status: 'Warning', health: 65, lastCheck: 'Today' },
    { name: 'Tomatoes', variety: 'Roma', status: 'Healthy', health: 88, lastCheck: '5 days ago' },
  ];

  return (
    <div className="container mx-auto px-4 pt-4 pb-24 animate-fade-in max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-secondary tracking-tighter">My Crops</h2>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Active Cultivations</p>
        </div>
        <button className="bg-primary text-white p-4 rounded-3xl shadow-lg hover:bg-secondary transition-all active:scale-95">
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {crops.map((crop, index) => (
          <div key={index} className="bg-white rounded-[2rem] p-6 border border-black/5 shadow-sm hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${crop.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  <Sprout size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-dark tracking-tight">{crop.name}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{crop.variety}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className={`text-sm font-black uppercase tracking-widest ${crop.status === 'Healthy' ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {crop.status}
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Health: {crop.health}%</div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Last Check: {crop.lastCheck}</span>
              {crop.status === 'Warning' && (
                <div className="flex items-center gap-1 text-orange-600 animate-pulse">
                  <AlertCircle size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Action Required</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ExpertAdvice title="Crop Rotation Tip">
        Rotating your <span className="font-bold text-primary">Organic Onions</span> with legumes next season will naturally replenish soil nitrogen levels, reducing the need for external fertilizers.
      </ExpertAdvice>
    </div>
  );
};

export default MyCrops;
