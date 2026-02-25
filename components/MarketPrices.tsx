
import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { LeafIcon } from './icons';
import { ExpertAdvice } from './DesignSystem';

interface PriceData {
  id: number;
  crop: string;
  price: number;
  unit: string;
  change: number;
  status: 'up' | 'down' | 'stable';
  location: string;
}

const MarketPrices: React.FC = () => {
  const { t } = useLocalization();
  
  // Mock data for market prices
  const [prices] = useState<PriceData[]>([
    { id: 1, crop: 'Organic Onion', price: 45, unit: 'kg', change: 2.5, status: 'up', location: 'Nashik Mandi' },
    { id: 2, crop: 'Wheat (Sharbati)', price: 2800, unit: 'quintal', change: -1.2, status: 'down', location: 'Indore Mandi' },
    { id: 3, crop: 'Organic Tomato', price: 35, unit: 'kg', change: 0, status: 'stable', location: 'Pune Market' },
    { id: 4, crop: 'Cotton', price: 7200, unit: 'quintal', change: 5.4, status: 'up', location: 'Akola Mandi' },
    { id: 5, crop: 'Soybean', price: 4800, unit: 'quintal', change: -0.5, status: 'down', location: 'Latur Mandi' },
  ]);

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in max-w-lg pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-secondary tracking-tighter leading-none">Market Prices</h2>
        <p className="text-sm text-gray-400 font-bold mt-2 uppercase tracking-wider">Live Mandi Rates</p>
      </div>

      <div className="grid gap-4">
        {prices.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-3xl p-5 border border-black/5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <LeafIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-dark text-lg leading-tight">{item.crop}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{item.location}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  item.status === 'up' ? 'bg-emerald-100 text-emerald-700' : 
                  item.status === 'down' ? 'bg-red-100 text-red-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.status === 'up' ? '↑' : item.status === 'down' ? '↓' : '•'} {Math.abs(item.change)}%
                </span>
              </div>
              <p className="text-xl font-black text-dark mt-1">
                ₹{item.price}<span className="text-xs text-gray-400 font-medium ml-1">/{item.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Expert Insight Section */}
      <div className="mt-10">
        <ExpertAdvice title={t('marketPrices.expertInsight')}>
          <p>Prices for <span className="text-primary font-bold">Organic Onions</span> are expected to rise by 15% next week due to supply constraints in Nashik. Consider holding your stock for better returns.</p>
        </ExpertAdvice>
      </div>
    </div>
  );
};

export default MarketPrices;
