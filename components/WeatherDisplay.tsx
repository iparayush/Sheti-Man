import React from 'react';
import { Weather } from '../types';
import { SunIcon, CloudIcon, RainIcon, WindIcon, ThermometerIcon, DropletIcon, BotIcon, MapPinIcon } from './icons';
import Spinner from './Spinner';
import { useLocalization } from '../context/LocalizationContext';

interface WeatherDisplayProps {
    weatherData: Weather | null;
    loading: boolean;
    error: string;
    onRetry: () => void;
}

const getWeatherIcon = (condition: string) => {
    const lowerCaseCondition = condition.toLowerCase();
    if (lowerCaseCondition.includes('sun') || lowerCaseCondition.includes('clear')) {
        return <SunIcon className="w-8 h-8 text-gold" />;
    }
    if (lowerCaseCondition.includes('cloud')) {
        return <CloudIcon className="w-8 h-8 text-gray-400" />;
    }
    if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle') || lowerCaseCondition.includes('shower')) {
        return <RainIcon className="w-8 h-8 text-sky" />;
    }
    return <CloudIcon className="w-8 h-8 text-gray-400" />;
};

const WeatherStatItem: React.FC<{ icon: React.ReactNode, value: string, label: string }> = ({ icon, value, label }) => (
    <div className="flex items-center gap-2">
        <div className="text-gray-400 opacity-70">{icon}</div>
        <div className="flex flex-col">
            <span className="font-extrabold text-dark text-sm leading-none">{value}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-tighter font-black">{label}</span>
        </div>
    </div>
);

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, loading, error, onRetry }) => {
    const { t } = useLocalization();
    const isLocationDeniedError = error === t('weather.deniedError');

    return (
        <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-fade-in flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/5 rounded-full">
                        <MapPinIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest leading-none">{t('weather.title')}</h3>
                        <span className="text-base font-bold text-gray-700 truncate max-w-[180px] mt-1">{weatherData?.location || 'Detecting...'}</span>
                    </div>
                </div>
                
                {!loading && weatherData && (
                    <div className="flex items-center gap-5 bg-primary/5 pl-5 pr-6 py-2.5 rounded-full border border-primary/10">
                       {getWeatherIcon(weatherData.condition)}
                       <div className="flex flex-col items-end">
                          <p className="text-3xl font-black text-dark tracking-tighter leading-none">{weatherData.temperature}°C</p>
                          <p className="text-[11px] font-black text-primary uppercase tracking-tighter leading-none mt-1.5">{weatherData.condition}</p>
                       </div>
                    </div>
                )}
            </div>

            {loading && (
                <div className="py-6 flex justify-center">
                   <Spinner />
                </div>
            )}

            {isLocationDeniedError && (
                <div className="text-center py-4 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-700 font-bold">{error}</p>
                    <button 
                        onClick={onRetry}
                        className="text-red-600 text-xs font-black uppercase mt-2.5 underline"
                    >
                        {t('weather.allowRetry')}
                    </button>
                </div>
            )}

            {!error && !loading && weatherData && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mt-2 border-t border-gray-50 pt-4">
                    <div className="flex gap-8">
                        <WeatherStatItem icon={<DropletIcon className="w-5 h-5" />} value={`${weatherData.humidity}%`} label={t('weather.humidity')} />
                        <WeatherStatItem icon={<WindIcon className="w-5 h-5" />} value={`${weatherData.windSpeed}`} label={t('weather.wind')} />
                    </div>
                    
                    <div className="flex-1 flex items-start gap-2.5 bg-accent/10 px-4 py-3 rounded-xl border border-accent/20">
                        <BotIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-secondary font-bold leading-tight italic">
                           {weatherData.recommendation}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherDisplay;