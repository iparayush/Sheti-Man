import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import WeatherDisplay from './WeatherDisplay';
import { Page, Weather } from '../types';
import { getWeatherInfo } from '../services/geminiService';
import { ScienceIcon, CalculatorIcon, BotIcon, CameraIcon, ShoppingCartIcon, PlusIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';

const Dashboard: React.FC<{ navigateTo: (page: Page) => void }> = ({ navigateTo }) => {
  const { t, language } = useLocalization();
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
    <div className="container mx-auto px-4 py-6 animate-fade-in max-w-lg h-full">
      <WeatherDisplay weatherData={weather} loading={loading} error={error} onRetry={fetchWeather} />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-secondary tracking-tighter">{t('dashboard.welcome')}</h2>
        <p className="text-base text-gray-500 font-bold mt-2">{t('dashboard.subheading')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-24">
        <Card title={t('dashboard.cards.recommendation.title')} description={t('dashboard.cards.recommendation.description')} color="#388E3C" icon={<ScienceIcon />} onClick={() => navigateTo(Page.RECOMMENDATION)} />
        <Card title={t('dashboard.cards.cropDoctor.title')} description={t('dashboard.cards.cropDoctor.description')} color="#D32F2F" icon={<CameraIcon />} onClick={() => navigateTo(Page.CROP_DOCTOR)} />
        <Card title={t('dashboard.cards.calculator.title')} description={t('dashboard.cards.calculator.description')} color="#1976D2" icon={<CalculatorIcon />} onClick={() => navigateTo(Page.CALCULATOR)} />
        <Card title={t('dashboard.cards.store.title')} description={t('dashboard.cards.store.description')} color="#8E24AA" icon={<ShoppingCartIcon />} onClick={() => navigateTo(Page.STORE)} />
        <Card title={t('dashboard.cards.farmTasks.title')} description={t('dashboard.cards.farmTasks.description')} color="#0097A7" icon={<PlusIcon />} onClick={() => navigateTo(Page.FARM_TASKS)} />
        <Card title={t('dashboard.cards.chatbot.title')} description={t('dashboard.cards.chatbot.description')} color="#F57C00" icon={<BotIcon />} onClick={() => navigateTo(Page.CHATBOT)} />
      </div>
    </div>
  );
};

export default Dashboard;