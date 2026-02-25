
import React from 'react';
import { Weather } from '../types';
import { SunIcon, CloudIcon, RainIcon, WindIcon, DropletIcon, MapPinIcon } from './icons';
import Spinner from './Spinner';
import { useLocalization } from '../context/LocalizationContext';
import { InsightCard, ExpertAdvice } from './DesignSystem';

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

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, loading, error, onRetry }) => {
    const { t } = useLocalization();
    const isLocationDeniedError = error === t('weather.deniedError');

    return (
        <div className="animate-fade-in flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-[2rem] border border-black/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                        <MapPinIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none">{t('weather.title')}</h3>
                        <span className="text-lg font-black text-dark truncate max-w-[180px] mt-1 tracking-tighter">{weatherData?.location || 'Detecting...'}</span>
                    </div>
                </div>
                
                {!loading && weatherData && (
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 flex items-center justify-center">
                         {getWeatherIcon(weatherData.condition)}
                       </div>
                       <div className="flex flex-col items-end">
                          <p className="text-3xl font-black text-dark tracking-tighter leading-none">{weatherData.temperature}°C</p>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mt-1.5">{weatherData.condition}</p>
                       </div>
                    </div>
                )}
            </div>

            {loading && (
                <div className="py-10 flex justify-center bg-white rounded-[2rem] border border-black/5 shadow-sm">
                   <Spinner />
                </div>
            )}

            {isLocationDeniedError && (
                <div className="text-center py-6 bg-red-50 rounded-[2rem] border border-red-100">
                    <p className="text-sm text-red-700 font-bold">{error}</p>
                    <button 
                        onClick={onRetry}
                        className="text-red-600 text-xs font-black uppercase mt-2.5 underline tracking-widest"
                    >
                        {t('weather.allowRetry')}
                    </button>
                </div>
            )}

            {!error && !loading && weatherData && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <InsightCard 
                          title={t('weather.humidity')} 
                          value={`${weatherData.humidity}%`} 
                          status={weatherData.humidity > 70 ? 'High' : 'Normal'}
                          statusType={weatherData.humidity > 70 ? 'warning' : 'healthy'}
                          icon={<DropletIcon />} 
                        />
                        <InsightCard 
                          title={t('weather.wind')} 
                          value={`${weatherData.windSpeed} km/h`} 
                          status={weatherData.windDirection}
                          icon={<WindIcon />} 
                        />
                    </div>
                    
                    <ExpertAdvice title="Weather Recommendation">
                       <p className="italic">{weatherData.recommendation}</p>
                    </ExpertAdvice>
                </div>
            )}
        </div>
    );
};

export default WeatherDisplay;
