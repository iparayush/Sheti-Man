
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { HistoryItem } from '../types';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

interface HistoryContextType {
  history: HistoryItem[];
  loading: boolean;
  addHistory: (item: Omit<HistoryItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteHistory: (id: string) => Promise<void>;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || user.id === 'guest') {
        setHistory([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped: HistoryItem[] = (data || []).map((h: any) => ({
          id: h.id,
          userId: h.user_id,
          type: h.type,
          input: h.input,
          result: h.result,
          imageUrl: h.image_url,
          createdAt: h.created_at
        }));
        setHistory(mapped);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const addHistory = async (item: Omit<HistoryItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!user || user.id === 'guest') {
        // For guest, just keep in local state
        const localItem: HistoryItem = {
            ...item,
            id: `LOCAL-${Date.now()}`,
            userId: 'guest',
            createdAt: new Date().toISOString()
        };
        setHistory(prev => [localItem, ...prev]);
        return;
    }

    const newItemDB = {
      user_id: user.id,
      type: item.type,
      input: item.input,
      result: item.result,
      image_url: item.imageUrl,
      created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase.from('history').insert([newItemDB]).select();
        if (error) throw error;
        
        if (data && data[0]) {
            const h = data[0];
            setHistory(prev => [{
                id: h.id,
                userId: h.user_id,
                type: h.type,
                input: h.input,
                result: h.result,
                imageUrl: h.image_url,
                createdAt: h.created_at
            }, ...prev]);
        }
    } catch (error) {
        console.error("Error adding history:", error);
    }
  };

  const deleteHistory = async (id: string) => {
    if (!user || user.id === 'guest') {
        setHistory(prev => prev.filter(h => h.id !== id));
        return;
    }

    try {
        const { error } = await supabase.from('history').delete().eq('id', id);
        if (error) throw error;
        setHistory(prev => prev.filter(h => h.id !== id));
    } catch (error) {
        console.error("Error deleting history:", error);
    }
  };

  return (
    <HistoryContext.Provider value={{ history, loading, addHistory, deleteHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) throw new Error('useHistory must be used within a HistoryProvider');
  return context;
};
