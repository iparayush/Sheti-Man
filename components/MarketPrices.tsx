
import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, MapPin, Filter, ShoppingBag } from 'lucide-react';
import { useLocalization } from '../context/LocalizationContext';
import { ExpertAdvice } from './DesignSystem';

interface PriceData {
  id: number;
  crop: string;
  price: number;
  unit: string;
  change: number;
  status: 'up' | 'down' | 'stable';
  location: string;
  category: string;
}

const MarketPrices: React.FC = () => {
  const { t } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'Vegetables', 'Grains', 'Fruits', 'Pulses'];

  const [prices] = useState<PriceData[]>([
    { id: 1, crop: 'Organic Onion', price: 45, unit: 'kg', change: 2.5, status: 'up', location: 'Nashik Mandi', category: 'Vegetables' },
    { id: 2, crop: 'Wheat (Sharbati)', price: 2800, unit: 'quintal', change: -1.2, status: 'down', location: 'Indore Mandi', category: 'Grains' },
    { id: 3, crop: 'Organic Tomato', price: 35, unit: 'kg', change: 0, status: 'stable', location: 'Pune Market', category: 'Vegetables' },
    { id: 4, crop: 'Cotton', price: 7200, unit: 'quintal', change: 5.4, status: 'up', location: 'Akola Mandi', category: 'Pulses' },
    { id: 5, crop: 'Soybean', price: 4800, unit: 'quintal', change: -0.5, status: 'down', location: 'Latur Mandi', category: 'Pulses' },
  ]);

  const filteredPrices = prices.filter(item => {
    const matchesSearch = item.crop.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 pt-4 pb-24 animate-fade-in max-w-4xl">
      <div className="mb-8">
        <h2 className="text-4xl font-black text-secondary tracking-tighter">Market Prices</h2>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Live Mandi Rates</p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-6 mb-8">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search crops or locations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-black/5 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:outline-none shadow-sm transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white text-gray-400 border border-black/5 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 mb-10">
        {filteredPrices.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-[2.5rem] p-6 border border-black/5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-primary flex items-center justify-center group-hover:rotate-3 transition-transform">
                <ShoppingBag size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-dark tracking-tight leading-none mb-1.5">{item.crop}</h3>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <MapPin size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.location}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-2">
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  item.status === 'up' ? 'bg-emerald-100 text-emerald-700' : 
                  item.status === 'down' ? 'bg-red-100 text-red-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.status === 'up' ? <TrendingUp size={12} /> : item.status === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
                  {Math.abs(item.change)}%
                </div>
              </div>
              <p className="text-2xl font-black text-dark tracking-tighter">
                ₹{item.price}<span className="text-xs text-gray-400 font-bold ml-1">/{item.unit}</span>
              </p>
            </div>
          </div>
        ))}
        {filteredPrices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No crops found matching your search</p>
          </div>
        )}
      </div>

      <ExpertAdvice title="Market Insight">
        Prices for <span className="text-primary font-bold">Organic Onions</span> are expected to rise by 15% next week due to supply constraints in Nashik. Consider holding your stock for better returns.
      </ExpertAdvice>
    </div>
  );
};

export default MarketPrices;
