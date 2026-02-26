
import React, { useState, useEffect, useCallback } from 'react';
import { Cloud, Sun, Thermometer, Droplets, Wind, Camera, FlaskConical, MessageSquare, ListTodo, Landmark, ShoppingBag, ChevronRight } from 'lucide-react';
import WeatherDisplay from './WeatherDisplay';
import { Page, Weather } from '../types';
import { getWeatherInfo } from '../services/geminiService';
import { useLocalization } from '../context/LocalizationContext';
import { useTasks } from '../context/TaskContext';
import { InsightCard, ExpertAdvice } from './DesignSystem';

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

  return (
    <div className="container mx-auto px-4 pt-4 pb-24 animate-fade-in max-w-4xl">
      <div className="mb-8">
        <h2 className="text-4xl font-black text-secondary tracking-tighter">{t('dashboard.welcome')}</h2>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">{t('dashboard.subheading')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Weather Widget - Prominent */}
        <div className="md:col-span-2">
          <WeatherDisplay weatherData={weather} loading={loading} error={error} onRetry={fetchWeather} />
        </div>

        {/* Soil Moisture Stat */}
        <div className="md:col-span-1">
          <InsightCard 
            title="Soil Moisture" 
            value="42%" 
            status="Optimal" 
            statusType="healthy"
            icon={<Droplets size={24} />} 
          />
        </div>

        {/* Action Buttons - Bento Style */}
        <div 
          onClick={() => navigateTo(Page.CROP_DOCTOR)}
          className="bg-red-50 rounded-[2.5rem] p-8 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all active:scale-95 group border border-red-100"
        >
          <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-200 group-hover:rotate-6 transition-transform">
            <Camera size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-red-900 tracking-tighter leading-none mb-2">{t('dashboard.cards.cropDoctor.title')}</h3>
            <p className="text-xs text-red-700/70 font-bold uppercase tracking-widest">{t('dashboard.cards.cropDoctor.description')}</p>
          </div>
        </div>

        <div 
          onClick={() => navigateTo(Page.SOIL_ANALYZER)}
          className="bg-emerald-50 rounded-[2.5rem] p-8 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all active:scale-95 group border border-emerald-100"
        >
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 group-hover:rotate-6 transition-transform">
            <FlaskConical size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-emerald-900 tracking-tighter leading-none mb-2">{t('dashboard.cards.soilAnalyzer.title')}</h3>
            <p className="text-xs text-emerald-700/70 font-bold uppercase tracking-widest">{t('dashboard.cards.soilAnalyzer.description')}</p>
          </div>
        </div>

        <div 
          onClick={() => navigateTo(Page.CHATBOT)}
          className="bg-blue-50 rounded-[2.5rem] p-8 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all active:scale-95 group border border-blue-100"
        >
          <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
            <MessageSquare size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-blue-900 tracking-tighter leading-none mb-2">AI Expert</h3>
            <p className="text-xs text-blue-700/70 font-bold uppercase tracking-widest">Chat with Shetiman</p>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4 md:col-span-3">
          <button 
            onClick={() => navigateTo(Page.FARM_TASKS)}
            className="bg-white rounded-3xl p-6 border border-black/5 flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-2xl text-gray-600 group-hover:bg-primary group-hover:text-white transition-all">
                <ListTodo size={20} />
              </div>
              <span className="font-black text-dark tracking-tight">{t('dashboard.cards.farmTasks.title')}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>

          <button 
            onClick={() => navigateTo(Page.GOVERNMENT_SCHEMES)}
            className="bg-white rounded-3xl p-6 border border-black/5 flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-2xl text-gray-600 group-hover:bg-primary group-hover:text-white transition-all">
                <Landmark size={20} />
              </div>
              <span className="font-black text-dark tracking-tight">{t('dashboard.cards.schemes.title')}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </div>
      </div>

      <ExpertAdvice title="Morning Insight">
        Based on the current <span className="font-bold text-primary">42% soil moisture</span> and upcoming sunny weather, it's the perfect time to apply organic mulch to retain hydration for your crops.
      </ExpertAdvice>
    </div>
  );
};

export default Dashboard;
