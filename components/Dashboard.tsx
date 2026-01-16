import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import WeatherDisplay from './WeatherDisplay';
import { Page, Weather } from '../types';
import { getWeatherInfo } from '../services/geminiService';
import { ScienceIcon, CalculatorIcon, BotIcon, CameraIcon, ClipboardListIcon, CheckSquareIcon, PlusIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';
import { useTasks } from '../context/TaskContext';

const Dashboard: React.FC<{ navigateTo: (page: Page) => void }> = ({ navigateTo }) => {
  const { t, language } = useLocalization();
  const { tasks, toggleTask } = useTasks();
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
      } catch (err) {
        setError('Failed to fetch weather data.');
      } finally { setLoading(false); }
    }, () => {
      setError(t('weather.deniedError'));
      setLoading(false);
    });
  }, [language, t]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in max-w-lg h-full overflow-hidden flex flex-col pb-24">
      <WeatherDisplay weatherData={weather} loading={loading} error={error} onRetry={fetchWeather} />
      
      <div className="text-center mb-8 px-2">
        <h2 className="text-3xl font-black text-secondary tracking-tighter leading-tight">{t('dashboard.welcome')}</h2>
        <p className="text-base text-gray-500 font-bold max-w-[280px] mx-auto leading-tight opacity-70 mt-2">{t('dashboard.subheading')}</p>
      </div>

      <div className="flex-grow">
        <div className="grid grid-cols-2 gap-4 mb-8">
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
              title={t('dashboard.cards.calculator.title')} 
              description={t('dashboard.cards.calculator.description')} 
              color="#1976D2"
              icon={<CalculatorIcon />} 
              onClick={() => navigateTo(Page.CALCULATOR)} 
            />
            <Card 
              title={t('dashboard.cards.chatbot.title')} 
              description={t('dashboard.cards.chatbot.description')} 
              color="#F57C00"
              icon={<BotIcon />} 
              onClick={() => navigateTo(Page.CHATBOT)} 
            />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-black text-primary flex items-center gap-2 uppercase tracking-widest">
               <div className="bg-primary/10 p-2 rounded-md">
                 <ClipboardListIcon className="w-5 h-5 text-primary" />
               </div>
               {t('farmTasksPage.title')}
             </h3>
             <button onClick={() => navigateTo(Page.FARM_TASKS)} className="bg-primary text-white p-2 rounded-lg shadow-sm hover:bg-secondary transition-all active:scale-90">
               <PlusIcon className="w-5 h-5" />
             </button>
          </div>
          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.slice(0, 2).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl transition-all group cursor-pointer border border-transparent hover:border-primary/10" onClick={() => toggleTask(task.id)}>
                  <div className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-md border-2 transition-all duration-300 ${task.isCompleted ? 'bg-primary border-primary text-white' : 'border-gray-200 bg-white text-transparent'}`}>
                    <CheckSquareIcon className="w-5 h-5" />
                  </div>
                  <p className={`font-bold text-base truncate tracking-tight ${task.isCompleted ? 'text-gray-400 line-through font-normal' : 'text-dark'}`}>{task.text}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-gray-400 font-bold">No tasks pending.</div>
            )}
          </div>
        </div>
      </div>
      <p className="text-center text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4 opacity-40">{t('footer.text')}</p>
    </div>
  );
};

export default Dashboard;