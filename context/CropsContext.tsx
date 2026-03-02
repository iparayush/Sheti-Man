
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

export interface Crop {
  id: string;
  userId: string;
  name: string;
  variety: string;
  status: 'Healthy' | 'Warning' | 'Critical';
  health: number;
  lastCheck: string;
  createdAt: string;
}

interface CropsContextType {
  crops: Crop[];
  loading: boolean;
  addCrop: (crop: Omit<Crop, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateCrop: (id: string, updates: Partial<Crop>) => Promise<void>;
  deleteCrop: (id: string) => Promise<void>;
}

const CropsContext = createContext<CropsContextType | undefined>(undefined);

export const CropsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCrops = async () => {
      if (!user || user.id === 'guest') {
        setCrops([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('crops')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped: Crop[] = (data || []).map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          name: c.name,
          variety: c.variety,
          status: c.status,
          health: c.health,
          lastCheck: c.last_check,
          createdAt: c.created_at
        }));
        setCrops(mapped);
      } catch (error) {
        console.error("Error fetching crops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, [user]);

  const addCrop = async (cropData: Omit<Crop, 'id' | 'userId' | 'createdAt'>) => {
    if (!user || user.id === 'guest') return;

    const newCropDB = {
      user_id: user.id,
      name: cropData.name,
      variety: cropData.variety,
      status: cropData.status,
      health: cropData.health,
      last_check: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.from('crops').insert([newCropDB]).select();
      if (error) throw error;
      
      if (data && data[0]) {
        const c = data[0];
        setCrops(prev => [{
          id: c.id,
          userId: c.user_id,
          name: c.name,
          variety: c.variety,
          status: c.status,
          health: c.health,
          lastCheck: c.last_check,
          createdAt: c.created_at
        }, ...prev]);
      }
    } catch (error) {
      console.error("Error adding crop:", error);
    }
  };

  const updateCrop = async (id: string, updates: Partial<Crop>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.variety) dbUpdates.variety = updates.variety;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.health !== undefined) dbUpdates.health = updates.health;
    if (updates.lastCheck) dbUpdates.last_check = updates.lastCheck;

    try {
      const { error } = await supabase.from('crops').update(dbUpdates).eq('id', id);
      if (error) throw error;
      setCrops(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (error) {
      console.error("Error updating crop:", error);
    }
  };

  const deleteCrop = async (id: string) => {
    try {
      const { error } = await supabase.from('crops').delete().eq('id', id);
      if (error) throw error;
      setCrops(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting crop:", error);
    }
  };

  return (
    <CropsContext.Provider value={{ crops, loading, addCrop, updateCrop, deleteCrop }}>
      {children}
    </CropsContext.Provider>
  );
};

export const useCrops = () => {
  const context = useContext(CropsContext);
  if (!context) throw new Error('useCrops must be used within a CropsProvider');
  return context;
};
