
import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getFertilizerRecommendation, textToSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audio';
import { RecommendationFormState } from '../types';
import { SpeakerIcon, ScienceIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';
import { ExpertAdvice, ThinkingState } from './DesignSystem';
import { useHistory } from '../context/HistoryContext';

const RecommendationForm: React.FC = () => {
  const { language, t } = useLocalization();
  const { addHistory } = useHistory();
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
      
      // Save to history
      await addHistory({
        type: 'recommendation',
        input: `Crop: ${formData.cropName}, pH: ${formData.soilPH}, Climate: ${formData.climate}`,
        result: response.text
      });
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
        const audioData = await textToSpeech(text);
        if (audioData) {
            await playAudio(audioData);
        }
    } catch(e) {
        setError("Sorry, we couldn't read the text aloud.");
    } finally {
        setTtsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in max-w-lg pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-secondary tracking-tighter leading-none">{t('recommendationForm.title')}</h2>
        <p className="text-sm text-gray-400 font-bold mt-2 uppercase tracking-wider">AI Crop Optimization</p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="cropName" className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 block ml-1">{t('recommendationForm.cropNameLabel')}</label>
              <input type="text" name="cropName" id="cropName" value={formData.cropName} onChange={handleChange} className="w-full p-4 bg-background border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="soilPH" className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 block ml-1">{t('recommendationForm.soilPhLabel')}</label>
                <input type="number" name="soilPH" id="soilPH" value={formData.soilPH} onChange={handleChange} className="w-full p-4 bg-background border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all" step="0.1" min="0" max="14" required />
              </div>
              <div>
                <label htmlFor="soilMoisture" className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 block ml-1">{t('recommendationForm.soilMoistureLabel')}</label>
                <input type="number" name="soilMoisture" id="soilMoisture" value={formData.soilMoisture} onChange={handleChange} className="w-full p-4 bg-background border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all" min="0" max="100" required />
              </div>
            </div>

            <div>
              <label htmlFor="climate" className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 block ml-1">{t('recommendationForm.climateLabel')}</label>
              <input type="text" name="climate" id="climate" value={formData.climate} onChange={handleChange} className="w-full p-4 bg-background border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all" placeholder={t('recommendationForm.climatePlaceholder')} required />
            </div>

            <div>
              <label className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 block ml-1">{t('recommendationForm.npkLabel')}</label>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" name="nitrogen" placeholder="N" value={formData.nitrogen} onChange={handleChange} className="w-full p-4 bg-background border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all" required />
                <input type="number" name="phosphorus" placeholder="P" value={formData.phosphorus} onChange={handleChange} className="w-full p-4 bg-background border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all" required />
                <input type="number" name="potassium" placeholder="K" value={formData.potassium} onChange={handleChange} className="w-full p-4 bg-background border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all" required />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-black uppercase tracking-[0.15em] shadow-lg shadow-primary/20 hover:bg-secondary active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:shadow-none disabled:text-gray-400"
          >
            {loading ? 'Calculating...' : t('recommendationForm.submitButton')}
          </button>
        </form>

        {loading && (
          <div className="flex justify-center py-4">
            <ThinkingState label="Generating Plan..." />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p className="text-xs font-bold text-red-700">{error}</p>
          </div>
        )}
        
        {result && result.text && (
          <div className="animate-slide-up">
            <ExpertAdvice title={t('recommendationForm.resultTitle')}>
              <div className="flex justify-end mb-4 -mt-12 relative z-20">
                <button 
                  onClick={() => handleSpeak(result.text)} 
                  disabled={ttsLoading} 
                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md active:scale-90 transition-all disabled:opacity-50"
                >
                  {ttsLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  ) : (
                    <SpeakerIcon className="w-6 h-6 text-primary" />
                  )}
                </button>
              </div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.text}</ReactMarkdown>
            </ExpertAdvice>
          </div>
        )}

        {!loading && !result && !error && (
          <div className="text-center py-10 opacity-30">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <ScienceIcon className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('recommendationForm.placeholder')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationForm;
