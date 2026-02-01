
import React, { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeCropImage, textToSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audio';
import Spinner from './Spinner';
import { UploadIcon, SpeakerIcon, LeafIcon, DocumentScannerIcon, BotIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';

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
        // textToSpeech now returns a base64 audio string from Gemini API
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
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-4xl pb-24">
      <h2 className="text-3xl font-extrabold text-secondary mb-8 text-center">{t('cropDoctor.title')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col">
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
              className="group relative w-full aspect-square md:aspect-auto md:h-80 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col justify-center items-center cursor-pointer hover:border-primary/50 hover:bg-green-50/30 transition-all mb-6 overflow-hidden"
            >
                {imagePreview ? (
                    <img src={imagePreview} alt="Plant preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                    <div className="text-center p-6">
                        <UploadIcon className="w-16 h-16 mx-auto text-gray-300 group-hover:text-primary transition-colors mb-4" />
                        <p className="font-bold text-gray-700">{t('cropDoctor.uploadPrompt')}</p>
                        <p className="text-xs text-gray-400 mt-1">{t('cropDoctor.uploadHint')}</p>
                    </div>
                )}
                {imagePreview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                    <p className="text-white font-bold">Change Image</p>
                  </div>
                )}
            </div>

            <label className="block text-sm font-bold text-gray-700 mb-2">Contextual Notes</label>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('cropDoctor.promptPlaceholder')}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
                rows={3}
            />

            <button 
              onClick={handleAnalyze} 
              disabled={loading || !imageFile} 
              className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl hover:bg-green-700 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:shadow-none"
            >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : (
                  <>
                    <LeafIcon className="w-6 h-6" />
                    {t('cropDoctor.submitButton')}
                  </>
                )}
            </button>
        </div>

        {/* Results Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 min-h-[300px]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Spinner />
              <p className="text-gray-400 animate-pulse">Consulting the AI Doctor...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-center">
              {error}
            </div>
          )}

          {result && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                  <DocumentScannerIcon className="w-6 h-6 text-primary" />
                  {t('cropDoctor.resultTitle')}
                </h3>
                <button 
                  onClick={handleSpeak} 
                  disabled={ttsLoading} 
                  className="p-2 rounded-xl bg-green-50 text-primary hover:bg-green-100 transition-colors disabled:opacity-50" 
                  aria-label="Read report aloud"
                >
                  {ttsLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  ) : (
                    <SpeakerIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="prose prose-green max-w-none overflow-y-auto max-h-[500px] pr-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          )}
          
          {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed border-gray-50 rounded-xl">
               <BotIcon className="w-16 h-16 text-gray-100 mb-4" />
               <p className="text-gray-400 font-medium">{t('cropDoctor.placeholder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropDoctor;
