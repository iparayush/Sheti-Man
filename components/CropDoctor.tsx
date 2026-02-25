
import React, { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeCropImage, textToSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audio';
import { UploadIcon, SpeakerIcon, LeafIcon, ScienceIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';
import { ExpertAdvice, ThinkingState } from './DesignSystem';

const CropDoctor: React.FC = () => {
  const { language, t } = useLocalization();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [ttsLoading, setTtsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    try {
      const response = await analyzeCropImage(imageFile, prompt, language);
      setResult(response);
    } catch (err) {
      setError('Failed to analyze the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleSpeak = async () => {
    if (!result || ttsLoading) return;
    setTtsLoading(true);
    try {
        const audioData = await textToSpeech(result);
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
        <h2 className="text-3xl font-black text-secondary tracking-tighter leading-none">{t('cropDoctor.title')}</h2>
        <p className="text-sm text-gray-400 font-bold mt-2 uppercase tracking-wider">AI Plant Disease Expert</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col items-center relative overflow-hidden">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            
            <div 
              onClick={triggerFileSelect} 
              className="w-full h-72 bg-background rounded-3xl flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 mb-6 border-2 border-dashed border-primary/20 transition-all relative overflow-hidden group"
            >
                {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img src={imagePreview} alt="Crop preview" className="w-full h-full object-cover" />
                      {loading && (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                          <ThinkingState label="Consulting AI Doctor..." />
                        </div>
                      )}
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                         <UploadIcon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                ) : (
                    <div className="text-center px-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <UploadIcon className="w-8 h-8 text-primary" />
                        </div>
                        <p className="font-bold text-dark">{t('cropDoctor.uploadPrompt')}</p>
                        <p className="text-xs text-gray-400 font-medium mt-1">{t('cropDoctor.uploadHint')}</p>
                    </div>
                )}
            </div>

            <div className="w-full space-y-4">
              <div className="relative">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('cropDoctor.promptPlaceholder')}
                    className="w-full p-4 bg-background border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
                    rows={3}
                />
              </div>

              <button 
                onClick={handleAnalyze} 
                disabled={loading || !imageFile} 
                className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-black uppercase tracking-[0.15em] shadow-lg shadow-primary/20 hover:bg-secondary active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:shadow-none disabled:text-gray-400"
              >
                  {loading ? 'Consulting...' : t('cropDoctor.submitButton')}
              </button>
            </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p className="text-xs font-bold text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="animate-slide-up">
            <ExpertAdvice title={t('cropDoctor.resultTitle')}>
              <div className="flex justify-end mb-4 -mt-12 relative z-20">
                <button 
                  onClick={handleSpeak} 
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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </ExpertAdvice>
          </div>
        )}
        
        {!loading && !result && !error && (
          <div className="text-center py-10 opacity-30">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <ScienceIcon className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('cropDoctor.placeholder')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropDoctor;
