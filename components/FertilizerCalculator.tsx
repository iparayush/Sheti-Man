
import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { calculateFertilizer, textToSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audio';
import { CalculatorFormState } from '../types';
import Spinner from './Spinner';
import { SpeakerIcon, CalculatorIcon, ScienceIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';

const FertilizerCalculator: React.FC = () => {
  const { language, t } = useLocalization();
  const [formData, setFormData] = useState<CalculatorFormState>({
    landSize: '1',
    cropType: 'Wheat',
    fertilizerType: 'Compost',
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
      const response = await calculateFertilizer(formData, language);
      setResult(response);
    } catch (err) {
      setError('Failed to calculate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!result?.text || ttsLoading) return;
    setTtsLoading(true);
    try {
        const audioData = await textToSpeech(result.text);
        if (audioData) await playAudio(audioData);
    } catch(e) {
        setError("Sorry, we couldn't read the text aloud.");
    } finally {
        setTtsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-4xl pb-24">
      <h2 className="text-3xl font-extrabold text-secondary mb-8 text-center">{t('calculator.title')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-fit">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="landSize" className="block text-sm font-bold text-gray-700 mb-1">{t('calculator.landSizeLabel')}</label>
              <input 
                type="number" 
                name="landSize" 
                id="landSize" 
                value={formData.landSize} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all" 
                min="0.1" 
                step="0.1" 
                required 
              />
            </div>
            <div>
              <label htmlFor="cropType" className="block text-sm font-bold text-gray-700 mb-1">{t('calculator.cropTypeLabel')}</label>
              <select 
                name="cropType" 
                id="cropType" 
                value={formData.cropType} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all appearance-none" 
                required
              >
                <option value="Wheat">Wheat (गेहूँ)</option>
                <option value="Rice">Rice (चावल)</option>
                <option value="Cotton">Cotton (कपास)</option>
                <option value="Tomato">Tomato (टमाटर)</option>
                <option value="Sugarcane">Sugarcane (गन्ना)</option>
                <option value="Maize">Maize (मक्का)</option>
              </select>
            </div>
            <div>
              <label htmlFor="fertilizerType" className="block text-sm font-bold text-gray-700 mb-1">{t('calculator.fertilizerTypeLabel')}</label>
              <input 
                type="text" 
                name="fertilizerType" 
                id="fertilizerType" 
                value={formData.fertilizerType} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all" 
                placeholder={t('calculator.fertilizerTypePlaceholder')} 
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl hover:bg-green-700 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <>
                  <CalculatorIcon className="w-6 h-6" />
                  {t('calculator.submitButton')}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 min-h-[300px]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Spinner />
              <p className="text-gray-400 animate-pulse italic">Calculating precise dosages...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-center">
              {error}
            </div>
          )}

          {result && result.text && (
             <div className="animate-fade-in">
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <ScienceIcon className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-bold text-primary">{t('calculator.resultTitle')}</h3>
                    </div>
                    <button 
                      onClick={handleSpeak} 
                      disabled={ttsLoading} 
                      className="p-2 rounded-xl bg-white text-primary hover:bg-gray-50 transition-colors disabled:opacity-50 border border-green-100 shadow-sm"
                    >
                      {ttsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        <SpeakerIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="prose prose-sm prose-green max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.text}</ReactMarkdown>
                  </div>
                </div>

                {result.sources && result.sources.length > 0 && (
                  <div className="pt-4 border-t border-gray-50">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data Sources</h4>
                    <ul className="space-y-1">
                      {result.sources.map((source, i) => (
                        source.web && (
                          <li key={i}>
                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                              • {source.web.title}
                            </a>
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}
          
          {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed border-gray-50 rounded-xl">
               <CalculatorIcon className="w-16 h-16 text-gray-100 mb-4" />
               <p className="text-gray-400 font-medium">{t('calculator.placeholder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FertilizerCalculator;
