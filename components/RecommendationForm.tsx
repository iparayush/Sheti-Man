
import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getFertilizerRecommendation } from '../services/geminiService';
import { playAudio } from '../utils/audio';
import { RecommendationFormState } from '../types';
import Spinner from './Spinner';
import { SpeakerIcon, BotIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';

const RecommendationForm: React.FC = () => {
  const { language, t } = useLocalization();
  const [formData, setFormData] = useState<RecommendationFormState>({
    cropName: 'Tomato',
    soilPH: '6.5',
    soilMoisture: '60',
    climate: 'Temperate',
    nitrogen: '120',
    phosphorus: '60',
    potassium: '100',
  });
  const [result, setResult] = useState<{ text: string, sources?: any[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [ttsLoading, setTtsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await getFertilizerRecommendation(formData, language);
      setResult(response);
    } catch (err) {
      setError('Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSpeak = async (text: string) => {
    if (!text || ttsLoading) return;
    setTtsLoading(true);
    try {
        await playAudio(text);
    } catch(e) {
        setError("Sorry, we couldn't read the text aloud.");
    } finally {
        setTtsLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pb-28">
      <h2 className="text-4xl font-black text-secondary mb-10 text-center tracking-tighter">{t('recommendationForm.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md space-y-6">
          <div>
            <label htmlFor="cropName" className="block text-sm font-bold text-gray-700 mb-2">{t('recommendationForm.cropNameLabel')}</label>
            <input type="text" name="cropName" id="cropName" value={formData.cropName} onChange={handleChange} className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-lg font-medium" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="soilPH" className="block text-sm font-bold text-gray-700 mb-2">{t('recommendationForm.soilPhLabel')}</label>
              <input type="number" name="soilPH" id="soilPH" value={formData.soilPH} onChange={handleChange} className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-lg font-medium" step="0.1" min="0" max="14" required />
            </div>
            <div>
              <label htmlFor="soilMoisture" className="block text-sm font-bold text-gray-700 mb-2">{t('recommendationForm.soilMoistureLabel')}</label>
              <input type="number" name="soilMoisture" id="soilMoisture" value={formData.soilMoisture} onChange={handleChange} className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-lg font-medium" min="0" max="100" required />
            </div>
          </div>
          <div>
            <label htmlFor="climate" className="block text-sm font-bold text-gray-700 mb-2">{t('recommendationForm.climateLabel')}</label>
            <input type="text" name="climate" id="climate" value={formData.climate} onChange={handleChange} className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-lg font-medium" placeholder={t('recommendationForm.climatePlaceholder')} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('recommendationForm.npkLabel')}</label>
            <div className="grid grid-cols-3 gap-3">
              <input type="number" name="nitrogen" placeholder="N" value={formData.nitrogen} onChange={handleChange} className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-lg font-medium" required />
              <input type="number" name="phosphorus" placeholder="P" value={formData.phosphorus} onChange={handleChange} className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-lg font-medium" required />
              <input type="number" name="potassium" placeholder="K" value={formData.potassium} onChange={handleChange} className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-lg font-medium" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 px-6 rounded-xl font-bold text-xl hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:bg-gray-400 transition-all shadow-lg shadow-primary/20">
            {loading ? t('recommendationForm.submittingButton') : t('recommendationForm.submitButton')}
          </button>
        </form>

        <div className="bg-white p-8 rounded-2xl shadow-md space-y-8 min-h-[400px]">
          {loading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
          {error && <p className="text-lg text-red-500 font-bold text-center">{error}</p>}
          
          {result && result.text && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-50">
                <h3 className="text-2xl font-black text-secondary tracking-tight">{t('recommendationForm.resultTitle')}</h3>
                <button onClick={() => handleSpeak(result.text)} disabled={ttsLoading} className="p-3 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50" aria-label="Read recommendation aloud">
                    {ttsLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div> : <SpeakerIcon className="w-6 h-6 text-secondary" />}
                </button>
              </div>
              <div className="prose prose-lg max-w-none prose-green">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.text}</ReactMarkdown>
              </div>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                <BotIcon className="w-20 h-20 text-gray-200 mb-4" />
                <p className="text-lg text-gray-500 font-bold">{t('recommendationForm.placeholder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationForm;
