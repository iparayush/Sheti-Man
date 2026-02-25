
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getGovernmentSchemeInfo, textToSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audio';
import Spinner from './Spinner';
import { SpeakerIcon, BankIcon, SendIcon, BotIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';

const GovernmentSchemes: React.FC = () => {
  const { language, t } = useLocalization();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<{ name: string, fullData: { text: string, sources?: any[] } } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [ttsLoading, setTtsLoading] = useState<boolean>(false);
  const [isDetailView, setIsDetailView] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSearch = async (customQuery?: string) => {
    const searchQuery = customQuery || query;
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);
    setIsDetailView(false);
    
    try {
      const response = await getGovernmentSchemeInfo(searchQuery, language);
      // Extract the first heading as the name
      const nameMatch = response.text.match(/^#\s+(.+)$/m);
      const schemeName = nameMatch ? nameMatch[1] : searchQuery;
      
      setResults({
        name: schemeName,
        fullData: response
      });
    } catch (err) {
      setError('Failed to fetch scheme information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!results?.fullData.text || ttsLoading) return;
    setTtsLoading(true);
    try {
        const audioData = await textToSpeech(results.fullData.text);
        if (audioData) await playAudio(audioData);
    } catch(e) {
        setError("Sorry, we couldn't read the text aloud.");
    } finally {
        setTtsLoading(false);
    }
  };

  const categories = [
    { id: 'loan', label: t('schemes.loan'), query: 'Farm Loans and Subsidies for farmers in India' },
    { id: 'insurance', label: t('schemes.insurance'), query: 'PM Fasal Bima Yojana details' },
    { id: 'irrigation', label: t('schemes.irrigation'), query: 'Drip irrigation and pump subsidies' },
    { id: 'pmkisan', label: t('schemes.pmkisan'), query: 'PM-Kisan Samman Nidhi Yojana benefits' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-4xl pb-24">
      <h2 className="text-3xl font-extrabold text-secondary mb-8 text-center flex items-center justify-center gap-3">
        <BankIcon className="w-8 h-8 text-primary" />
        {t('schemes.title')}
      </h2>

      <div className="space-y-6">
        {/* Search Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('schemes.searchPlaceholder')}
            className="flex-1 px-6 py-4 bg-transparent outline-none font-bold text-dark placeholder:text-gray-300"
          />
          <button 
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="bg-primary text-white p-4 rounded-xl hover:bg-green-700 disabled:bg-gray-200 transition-all flex items-center justify-center"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setQuery(cat.label); handleSearch(cat.query); }}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-primary/30 transition-all text-center group"
            >
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-primary transition-colors">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Results Display */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 min-h-[400px]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Spinner />
              <p className="text-gray-400 animate-pulse font-bold italic">Searching official government databases...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-center font-bold">
              {error}
            </div>
          )}

          {!loading && results && !isDetailView && (
            <div className="flex flex-col items-center justify-center h-full py-10 animate-fade-in">
              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 w-full max-w-md text-center">
                <BankIcon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-black text-secondary mb-2 leading-tight">{results.name}</h3>
                <p className="text-gray-500 text-sm mb-6 font-bold uppercase tracking-widest">Available Government Support</p>
                <button 
                  onClick={() => setIsDetailView(true)}
                  className="w-full bg-primary text-white font-black py-4 px-6 rounded-2xl hover:bg-secondary transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  Click for Full Info & Documents
                </button>
              </div>
            </div>
          )}

          {isDetailView && results && (
             <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                    <button 
                      onClick={() => setIsDetailView(false)}
                      className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 px-3 py-1 rounded-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                    <div className="flex gap-2">
                        <button 
                          onClick={handleSpeak} 
                          disabled={ttsLoading} 
                          className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          {ttsLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : (
                            <SpeakerIcon className="w-4 h-4" />
                          )}
                        </button>
                    </div>
                </div>

                <div className="prose prose-blue max-w-none mb-10 overflow-x-auto bg-[#E0F2F7] p-6 rounded-3xl">
                    {/* The markdown will contain the Documents Name Chart as a table */}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{results.fullData.text}</ReactMarkdown>
                </div>

                {results.fullData.sources && results.fullData.sources.length > 0 && (
                  <div className="pt-6 border-t border-gray-50">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Official Verification Links</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.fullData.sources.map((source, i) => (
                        source.web && (
                          <a 
                            key={i} 
                            href={source.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-gray-50 px-4 py-2 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-primary/5 hover:text-primary border border-gray-100 transition-all flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                            {source.web.title}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
          
          {!loading && !results && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 border-2 border-dashed border-gray-50 rounded-2xl">
               <div className="p-5 bg-gray-50 rounded-full mb-4">
                  <BankIcon className="w-10 h-10 text-gray-200" />
               </div>
               <p className="text-gray-400 font-bold max-w-xs">{t('schemes.noResults')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovernmentSchemes;
