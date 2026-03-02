import React, { useState } from 'react';
import { Sprout, Plus, ChevronRight, AlertCircle, Trash2 } from 'lucide-react';
import { ExpertAdvice } from './DesignSystem';
import { useCrops } from '../context/CropsContext';

const MyCrops: React.FC = () => {
  const { crops, loading, addCrop, deleteCrop } = useCrops();
  const [showAdd, setShowAdd] = useState(false);
  const [newCrop, setNewCrop] = useState({ name: '', variety: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrop.name) return;
    await addCrop({
      name: newCrop.name,
      variety: newCrop.variety,
      status: 'Healthy',
      health: 100,
      lastCheck: new Date().toISOString()
    });
    setNewCrop({ name: '', variety: '' });
    setShowAdd(false);
  };

  return (
    <div className="container mx-auto px-4 pt-4 pb-24 animate-fade-in max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-secondary tracking-tighter">My Crops</h2>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Active Cultivations</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white p-4 rounded-3xl shadow-lg hover:bg-secondary transition-all active:scale-95"
        >
          <Plus size={24} className={showAdd ? 'rotate-45 transition-transform' : 'transition-transform'} />
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm mb-6 animate-slide-up space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Crop Name (e.g. Wheat)" 
              value={newCrop.name}
              onChange={e => setNewCrop({...newCrop, name: e.target.value})}
              className="w-full p-4 bg-background border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20"
              required
            />
            <input 
              type="text" 
              placeholder="Variety (e.g. Sharbati)" 
              value={newCrop.variety}
              onChange={e => setNewCrop({...newCrop, variety: e.target.value})}
              className="w-full p-4 bg-background border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
            Add New Crop
          </button>
        </form>
      )}

      <div className="space-y-4 mb-8">
        {loading ? (
          <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Crops...</div>
        ) : crops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No crops added yet</p>
          </div>
        ) : (
          crops.map((crop) => (
            <div key={crop.id} className="bg-white rounded-[2rem] p-6 border border-black/5 shadow-sm hover:shadow-md transition-all group cursor-pointer">
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
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteCrop(crop.id); }}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Last Check: {new Date(crop.lastCheck).toLocaleDateString()}
                </span>
                {crop.status !== 'Healthy' && (
                  <div className="flex items-center gap-1 text-orange-600 animate-pulse">
                    <AlertCircle size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Action Required</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ExpertAdvice title="Crop Rotation Tip">
        Rotating your crops with legumes next season will naturally replenish soil nitrogen levels, reducing the need for external fertilizers.
      </ExpertAdvice>
    </div>
  );
};

export default MyCrops;
