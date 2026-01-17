
import React, { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeCropImage, textToSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audio';
import Spinner from './Spinner';
import { UploadIcon, SpeakerIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';

const SoilAnalyzer: React.FC = () => {
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
            await playAudio(audioData as string);
        }
    } catch(e) {
        setError("Sorry, we couldn't read the text aloud.");
    } finally {
        setTtsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-secondary mb-6 text-center">{t('soilAnalyzer.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            
            <div onClick={triggerFileSelect} className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 mb-4">
                {imagePreview ? (
                    <img src={imagePreview} alt="Soil preview" className="max-h-full max-w-full object-contain" />
                ) : (
                    <div className="text-center text-gray-500">
                        <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
                        <p>{t('cropDoctor.uploadPrompt')}</p>
                        <p className="text-sm">{t('cropDoctor.uploadHint')}</p>
                    </div>
                )}
            </div>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('cropDoctor.promptPlaceholder')}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                rows={2}
            />

            <button onClick={handleAnalyze} disabled={loading || !imageFile} className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                {loading ? t('recommendationForm.submittingButton') : t('cropDoctor.submitButton')}
            </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading && <Spinner />}
          {error && <p className="text-red-500">{error}</p>}
          {result && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-secondary">{t('recommendationForm.resultTitle')}</h3>
                <button onClick={handleSpeak} disabled={ttsLoading} className="p-1 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50" aria-label="Read report aloud">
                  {ttsLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div> : <SpeakerIcon className="w-5 h-5 text-secondary" />}
                </button>
              </div>
              <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          )}
          {!loading && !result && <p className="text-gray-500">{t('cropDoctor.placeholder')}</p>}
        </div>
      </div>
    </div>
  );
};

export default SoilAnalyzer;
