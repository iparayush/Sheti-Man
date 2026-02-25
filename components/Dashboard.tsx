
import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import WeatherDisplay from './WeatherDisplay';
import { Page, Weather } from '../types';
import { getWeatherInfo } from '../services/geminiService';
import { ScienceIcon, BotIcon, CameraIcon, ClipboardListIcon, CheckSquareIcon, BankIcon, LeafIcon } from './icons';
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

        <div className="col-span-2">
          <div 
            className="bg-white rounded-[2.5rem] shadow-sm p-6 flex items-center cursor-pointer transform active:scale-[0.98] transition-all duration-150 border border-black/5 hover:border-primary/10 hover:shadow-md group relative overflow-hidden"
            onClick={() => navigateTo(Page.SOIL_ANALYZER)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center gap-5 relative z-10 w-full">
              <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center transition-all duration-300 shadow-lg shadow-primary/20 group-hover:rotate-3">
                  <ScienceIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-dark tracking-tighter leading-none mb-1.5">{t('dashboard.cards.soilAnalyzer.title')}</h3>
                <p className="text-[11px] text-primary font-black uppercase tracking-[0.2em]">
                  {t('dashboard.cards.soilAnalyzer.description')}
                </p>
              </div>
              <div className="bg-background p-3 rounded-2xl text-primary/30 group-hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <Card 
          title={t('dashboard.cards.marketPrices.title')} 
          description={t('dashboard.cards.marketPrices.description')} 
          color="#FBC02D" 
          icon={<LeafIcon />} 
          onClick={() => navigateTo(Page.MARKET_PRICES)} 
        />

        <Card 
          title={t('dashboard.cards.schemes.title')} 
          description={t('dashboard.cards.schemes.description')} 
          color="#1565C0" 
          icon={<BankIcon />} 
          onClick={() => navigateTo(Page.GOVERNMENT_SCHEMES)} 
        />

        <div className="col-span-1">
            <Card 
              title={t('dashboard.cards.farmTasks.title')} 
              description={t('dashboard.cards.farmTasks.description')} 
              color="#00838F" 
              icon={<ClipboardListIcon />} 
              onClick={() => navigateTo(Page.FARM_TASKS)} 
            />
        </div>

        <div className="col-span-1">
            <Card 
              title={t('dashboard.cards.chatbot.title')} 
              description={t('dashboard.cards.chatbot.description')} 
              color="#F57C00" 
              icon={<BotIcon />} 
              onClick={() => navigateTo(Page.CHATBOT)} 
            />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
