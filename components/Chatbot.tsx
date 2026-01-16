import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendMessageToChat, textToSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audio';
import { ChatMessage, Page } from '../types';
import { LeafIcon, SendIcon, SpeakerIcon, BotIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';

interface ChatbotProps {
  navigateTo: (page: Page) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ navigateTo }) => {
  const { language, t } = useLocalization();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [ttsLoading, setTtsLoading] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { sender: 'bot', text: t('chatbot.greeting') }
    ]);
  }, [language, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (input.trim() === '' || loading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const botResponse = await sendMessageToChat(currentInput, language);
      const botMessage: ChatMessage = { sender: 'bot', text: botResponse.text, sources: botResponse.sources };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      const errorMsg: ChatMessage = { sender: 'bot', text: "I'm having trouble connecting. Please try again." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, language]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleSpeak = async (text: string, index: number) => {
    if (!text || ttsLoading) return;
    setTtsLoading(`tts-${index}`);
    try {
        const audioData = await textToSpeech(text);
        if (audioData) await playAudio(audioData);
    } catch (e) {
        console.error("TTS failed", e);
    } finally {
        setTtsLoading(null);
    }
  };

  return (
    <div className="h-screen w-screen bg-white flex flex-col font-sans animate-fade-in">
      <header className="bg-primary/5 border-b border-primary/10 shadow-sm z-10 shrink-0">
        <div className="container mx-auto px-5 py-6 flex justify-between items-center max-w-4xl">
          <div className="flex items-center space-x-5">
            <div className="bg-primary p-3 rounded-xl text-white shadow-lg shadow-primary/20">
              <BotIcon className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-secondary leading-tight">{t('chatbot.title')}</h1>
              <p className="text-base text-primary/70 font-semibold">{t('chatbot.subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={() => navigateTo(Page.DASHBOARD)} 
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-3.5 rounded-xl transition-all"
            aria-label="Close chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-grow p-6 overflow-y-auto container mx-auto w-full max-w-4xl">
        <div className="flex flex-col space-y-10">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-5 animate-fade-in ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && (
                <div className="flex-shrink-0 bg-secondary text-white p-3 rounded-xl shadow-md">
                    <LeafIcon className="w-7 h-7" />
                </div>
              )}
              <div className={`relative max-w-[85%] sm:max-w-[80%] p-6 shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-primary text-white rounded-2xl rounded-tr-none shadow-primary/10' 
                  : 'bg-gray-50 text-gray-800 rounded-2xl rounded-tl-none border border-gray-100'
              }`}>
                <div className={`prose prose-lg max-w-none ${msg.sender === 'user' ? 'prose-invert' : 'prose-green'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-gray-200">
                        <p className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-3">Sources</p>
                        <div className="flex flex-wrap gap-3">
                            {msg.sources.map((source, i) => (
                                source.web && (
                                  <a 
                                    key={i} 
                                    href={source.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-sm bg-primary/5 text-primary px-4 py-2 rounded-md hover:bg-primary/10 transition-colors inline-block max-w-[240px] truncate font-bold"
                                  >
                                    {source.web.title}
                                  </a>
                                )
                            ))}
                        </div>
                    </div>
                  )}

                {msg.sender === 'bot' && (
                    <div className="absolute bottom-2.5 right-2.5">
                        <button 
                          onClick={() => handleSpeak(msg.text, index)} 
                          disabled={!!ttsLoading} 
                          className="p-2.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors disabled:opacity-50"
                        >
                            {ttsLoading === `tts-${index}` ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                            ) : (
                                <SpeakerIcon className="w-6 h-6"/>
                            )}
                        </button>
                    </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 bg-secondary text-white p-3 rounded-xl">
                  <LeafIcon className="w-7 h-7" />
              </div>
              <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl rounded-tl-none shadow-sm flex gap-3">
                <span className="w-4 h-4 bg-primary/40 rounded-full animate-bounce"></span>
                <span className="w-4 h-4 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-4 h-4 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-8" />
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
        <div className="container mx-auto w-full max-w-4xl relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chatbot.placeholder')}
            className="w-full pl-10 pr-24 py-6 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all placeholder:text-gray-300 text-xl font-medium"
            disabled={loading}
          />
          <button 
            onClick={handleSend} 
            disabled={loading || input.trim() === ''} 
            className="absolute right-4 top-4 bottom-4 bg-primary text-white w-16 rounded-xl hover:bg-green-700 disabled:bg-gray-200 disabled:shadow-none shadow-lg shadow-primary/20 transition-all flex items-center justify-center focus:outline-none"
          >
            <SendIcon className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;