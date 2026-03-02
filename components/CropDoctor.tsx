
import React, { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Camera, Volume2, Sparkles, X, Stethoscope } from 'lucide-react';
import { analyzeCropImage, textToSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audio';
import { useLocalization } from '../context/LocalizationContext';
import { ExpertAdvice, AiThinkingLoader } from './DesignSystem';
import { useHistory } from '../context/HistoryContext';

const CropDoctor: React.FC = () => {
  const { language, t } = useLocalization();
  const { addHistory } = useHistory();
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
      
      // Save to history
      await addHistory({
        type: 'crop',
        input: prompt || 'Crop diagnosis request',
        result: response,
        imageUrl: imagePreview
      });
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

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container mx-auto px-4 pt-4 pb-24 animate-fade-in max-w-4xl">
      <div className="mb-8">
        <h2 className="text-4xl font-black text-secondary tracking-tighter">{t('cropDoctor.title')}</h2>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">AI Plant Disease Expert</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-black/5 flex flex-col items-center relative overflow-hidden">
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
              className="w-full h-80 bg-background rounded-[2.5rem] flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 mb-8 border-2 border-dashed border-primary/20 transition-all relative overflow-hidden group"
            >
                {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img src={imagePreview} alt="Crop preview" className="w-full h-full object-cover" />
                      {loading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-20">
                          <AiThinkingLoader label="Consulting AI Doctor..." />
                        </div>
                      )}
                      <button 
                        onClick={clearImage}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg hover:bg-red-50 hover:text-red-600 transition-all z-30"
                      >
                        <X size={20} />
                      </button>
                    </div>
                ) : (
                    <div className="text-center px-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                          <Camera size={32} className="text-primary" />
                        </div>
                        <p className="text-xl font-black text-dark tracking-tight">{t('cropDoctor.uploadPrompt')}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">{t('cropDoctor.uploadHint')}</p>
                    </div>
                )}
            </div>

            <div className="w-full space-y-6">
              <div className="relative">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('cropDoctor.promptPlaceholder')}
                    className="w-full p-6 bg-background border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-gray-400"
                    rows={3}
                />
              </div>

              <button 
                onClick={handleAnalyze} 
                disabled={loading || !imageFile} 
                className="w-full bg-primary text-white py-5 px-8 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-secondary active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:shadow-none disabled:text-gray-300 flex items-center justify-center gap-3"
              >
                  {loading ? (
                    <>
                      <Sparkles size={20} className="animate-pulse" />
                      Consulting...
                    </>
                  ) : (
                    <>
                      <Stethoscope size={20} />
                      {t('cropDoctor.submitButton')}
                    </>
                  )}
              </button>
            </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 animate-shake">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm font-black text-red-700 uppercase tracking-tight">{error}</p>
          </div>
        )}

        {result && (
          <div className="animate-slide-up">
            <ExpertAdvice title={t('cropDoctor.resultTitle')}>
              <div className="flex justify-end mb-4 -mt-14 relative z-20">
                <button 
                  onClick={handleSpeak} 
                  disabled={ttsLoading} 
                  className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all disabled:opacity-50 border border-black/5"
                >
                  {ttsLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  ) : (
                    <Volume2 size={24} className="text-primary" />
                  )}
                </button>
              </div>
              <div className="prose prose-green max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </ExpertAdvice>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropDoctor;
