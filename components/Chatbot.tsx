
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendMessageToChat, textToSpeech, resetChatSession, parseAiError } from '../services/geminiService';
import { playAudio } from '../utils/audio';
import { ChatMessage, Page } from '../types';
import { LeafIcon, SendIcon, SpeakerIcon, BotIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

interface ChatbotProps {
  navigateTo: (page: Page) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ navigateTo }) => {
  const { language, t } = useLocalization();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [ttsLoading, setTtsLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { sender: 'bot', text: t('chatbot.greeting') }
    ]);
  }, [language, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (retryText?: string) => {
    const textToSend = retryText || input;
    if (textToSend.trim() === '' || loading) return;

    if (!retryText) {
      setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
      setInput('');
    }
    
    setLoading(true);
    setStatus(null);

    try {
      if (user?.id && user.id !== 'guest') {
        supabase.from('user_questions').insert([{ user_id: user.id, question_text: textToSend }]).then();
      }

      const history = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const botResponse = await sendMessageToChat(textToSend, language, history);
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse.text }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { sender: 'bot', text: `⚠️ **Unable to connect to AI**\n\n${parseAiError(e)}` }]);
    } finally {
      setLoading(false);
      setStatus(null);
    }
  }, [input, loading, language, user, messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleSpeak = async (text: string, index: number) => {
    if (!text || ttsLoading) return;
    setTtsLoading(`tts-${index}`);
    try {
        const audioData = await textToSpeech(text);
        await playAudio(audioData || text);
    } catch (e) {
        console.error("TTS failed", e);
    } finally {
        setTtsLoading(null);
    }
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col font-sans animate-fade-in overflow-hidden">
      <header className="bg-white border-b border-gray-100 shadow-sm z-10 shrink-0">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-4xl">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-xl text-white shadow-md">
              <BotIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-secondary leading-tight">{t('chatbot.title')}</h1>
              <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">Multi-Provider AI Expert</p>
            </div>
          </div>
          <button 
            onClick={() => { resetChatSession(); navigateTo(Page.DASHBOARD); }} 
            className="text-gray-400 hover:text-red-500 p-2 rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-grow p-4 overflow-y-auto container mx-auto w-full max-w-4xl scroll-smooth">
        <div className="flex flex-col space-y-4 pb-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && (
                <div className="flex-shrink-0 bg-secondary text-white p-1.5 rounded-lg shadow-sm mt-1">
                    <LeafIcon className="w-4 h-4" />
                </div>
              )}
              <div className={`relative max-w-[85%] p-4 shadow-sm rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                <div className={`prose prose-sm max-w-none ${msg.sender === 'user' ? 'prose-invert' : 'prose-green'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
                
                {msg.sender === 'bot' && (
                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={() => handleSpeak(msg.text, index)} 
                      disabled={!!ttsLoading} 
                      className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-50"
                    >
                      {ttsLoading === `tts-${index}` ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      ) : (
                        <SpeakerIcon className="w-4 h-4"/>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 bg-secondary text-white p-1.5 rounded-lg">
                    <LeafIcon className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
              {status && <span className="text-[10px] text-gray-400 font-bold ml-10 italic uppercase tracking-widest">{status}</span>}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-50 shrink-0">
        <div className="container mx-auto w-full max-w-4xl relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chatbot.placeholder')}
            className="w-full pl-5 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-bold text-sm"
            disabled={loading}
          />
          <button 
            onClick={() => handleSend()} 
            disabled={loading || input.trim() === ''} 
            className="absolute right-2 top-2 bottom-2 bg-primary text-white w-12 rounded-xl hover:bg-green-700 disabled:bg-gray-200 transition-all flex items-center justify-center"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
