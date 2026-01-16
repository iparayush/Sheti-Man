
import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import WeatherDisplay from './WeatherDisplay';
import { Page, Weather } from '../types';
import { getWeatherInfo } from '../services/geminiService';
import { ScienceIcon, CalculatorIcon, BotIcon, CameraIcon, ClipboardListIcon, CheckSquareIcon, ShoppingCartIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';
import { useTasks } from '../context/TaskContext';

const Dashboard: React.FC<{ navigateTo: (page: Page) => void }> = ({ navigateTo }) => {
  const { t, language } = useLocalization();
  const { tasks } = useTasks();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = useCallback(() => {
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const data = await getWeatherInfo(pos.coords.latitude, pos.coords.longitude, language);
        setWeather(data);
      } catch (err) { setError('Failed to fetch weather.'); } finally { setLoading(false); }
    }, () => {
      setError(t('weather.deniedError'));
      setLoading(false);
    });
  }, [language, t]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  const activeTasks = tasks.filter(t => !t.isCompleted).slice(0, 2);
  const pendingCount = tasks.filter(t => !t.isCompleted).length;

  return (
    <div className="container mx-auto px-4 py-4 animate-fade-in max-w-lg h-full pb-10">
      <WeatherDisplay weatherData={weather} loading={loading} error={error} onRetry={fetchWeather} />
      
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-secondary tracking-tighter">{t('dashboard.welcome')}</h2>
        <p className="text-sm text-gray-400 font-bold mt-1.5">{t('dashboard.subheading')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <Card 
          title={t('dashboard.cards.recommendation.title')} 
          description={t('dashboard.cards.recommendation.description')} 
          color="#388E3C" 
          icon={<ScienceIcon />} 
          onClick={() => navigateTo(Page.RECOMMENDATION)} 
        />
        <Card 
          title={t('dashboard.cards.cropDoctor.title')} 
          description={t('dashboard.cards.cropDoctor.description')} 
          color="#D32F2F" 
          icon={<CameraIcon />} 
          onClick={() => navigateTo(Page.CROP_DOCTOR)} 
        />
        <Card 
          title={t('dashboard.cards.marketplace.title')} 
          description={t('dashboard.cards.marketplace.description')} 
          color="#8E24AA" 
          icon={<ShoppingCartIcon />} 
          onClick={() => navigateTo(Page.STORE)} 
        />
        <Card 
          title={t('dashboard.cards.chatbot.title')} 
          description={t('dashboard.cards.chatbot.description')} 
          color="#F57C00" 
          icon={<BotIcon />} 
          onClick={() => navigateTo(Page.CHATBOT)} 
        />

        <div className="col-span-2 mt-1">
            <div 
              className="bg-white rounded-3xl shadow-sm p-5 flex flex-col cursor-pointer transform active:scale-[0.98] transition-all duration-150 border border-gray-100 hover:border-emerald-200 hover:shadow-md group relative overflow-hidden"
              onClick={() => navigateTo(Page.FARM_TASKS)}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center transition-all duration-300 shadow-lg shadow-emerald-200/50">
                      <ClipboardListIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-dark tracking-tight leading-none mb-1">{t('dashboard.cards.farmTasks.title')}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">{t('dashboard.cards.farmTasks.description')}</span>
                        {pendingCount > 0 && (
                            <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-md font-black animate-pulse">
                                {pendingCount} Pending
                            </span>
                        )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-full text-gray-300 group-hover:text-emerald-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {activeTasks.length > 0 && (
                <div className="space-y-2 border-t border-gray-50 mt-4 pt-4 relative z-10">
                  {activeTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded border-2 border-emerald-100 flex items-center justify-center bg-emerald-50/30">
                        <CheckSquareIcon className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                      <span className="text-xs font-bold text-gray-500 truncate">{task.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
