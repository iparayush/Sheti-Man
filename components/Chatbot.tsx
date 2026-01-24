
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendMessageToChat, textToSpeech, resetChatSession } from '../services/geminiService';
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
      const userMessage: ChatMessage = { sender: 'user', text: textToSend };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
    }
    
    setLoading(true);

    try {
      if (user && user.id && user.id !== 'guest') {
        const { error } = await supabase
          .from('user_questions')
          .insert([{ user_id: user.id, question_text: textToSend }]);
        if (error) console.error("Error saving question:", error);
      }

      const botResponse = await sendMessageToChat(textToSend, language);
      const botMessage: ChatMessage = { sender: 'bot', text: botResponse.text, sources: botResponse.sources };
      setMessages(prev => [...prev, botMessage]);
    } catch (e: any) {
      console.error("Chat error:", e);
      resetChatSession();
      
      let errorData = e?.error || e;
      const errorMsgText = String(errorData?.message || e?.message || "").toLowerCase();
      const isQuota = errorMsgText.includes('quota') || errorMsgText.includes('429');

      const errorMsg: ChatMessage = { 
        sender: 'bot', 
        text: isQuota 
          ? "⚠️ **Service Limit Reached**: My organic wisdom channels are currently full. I am switching to a backup line. Please tap **Try Again** in 5 seconds."
          : "⚠️ **Connection Error**: I couldn't reach the knowledge base. Please try again." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, language, user]);

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
    <div className="h-screen w-screen bg-white flex flex-col font-sans animate-fade-in overflow-hidden">
      <header className="bg-primary/5 border-b border-primary/10 shadow-sm z-10 shrink-0">
        <div className="container mx-auto px-5 py-4 flex justify-between items-center max-w-4xl">
          <div className="flex items-center space-x-4">
            <div className="bg-primary p-2.5 rounded-xl text-white shadow-lg shadow-primary/20">
              <BotIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-secondary leading-tight">{t('chatbot.title')}</h1>
              <p className="text-xs text-primary/70 font-bold uppercase tracking-widest">{t('chatbot.subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={() => {
                resetChatSession();
                navigateTo(Page.DASHBOARD);
            }} 
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-grow p-5 overflow-y-auto container mx-auto w-full max-w-4xl scroll-smooth">
        <div className="flex flex-col space-y-8 pb-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 animate-fade-in ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && (
                <div className="flex-shrink-0 bg-secondary text-white p-2.5 rounded-xl shadow-md mt-1">
                    <LeafIcon className="w-5 h-5" />
                </div>
              )}
              <div className={`relative max-w-[85%] sm:max-w-[75%] p-5 shadow-sm transition-all ${
                msg.sender === 'user' 
                  ? 'bg-primary text-white rounded-2xl rounded-tr-none shadow-primary/10' 
                  : 'bg-gray-50 text-gray-800 rounded-2xl rounded-tl-none border border-gray-100'
              }`}>
                <div className={`prose prose-sm md:prose-base max-w-none ${msg.sender === 'user' ? 'prose-invert' : 'prose-green'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text ?? ""}</ReactMarkdown>
                </div>
                
                {msg.text.includes('⚠️') && (
                  <button 
                    onClick={() => {
                        const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
                        if (lastUserMsg) handleSend(lastUserMsg.text);
                    }}
                    className="mt-4 w-full py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-secondary transition-all shadow-md active:scale-95"
                  >
                    🔄 Try Again
                  </button>
                )}
                
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="font-bold text-[9px] text-gray-400 uppercase tracking-widest mb-2">Verified Sources</p>
                        <div className="flex flex-wrap gap-2">
                            {msg.sources.map((source, i) => (
                                source.web && (
                                  <a 
                                    key={i} 
                                    href={source.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[10px] bg-primary/5 text-primary px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors inline-block max-w-[200px] truncate font-bold border border-primary/5"
                                  >
                                    {source.web.title}
                                  </a>
                                )
                            ))}
                        </div>
                    </div>
                  )}

                {msg.sender === 'bot' && !msg.text.includes('⚠️') && (
                    <div className="absolute bottom-1 right-1">
                        <button 
                          onClick={() => handleSpeak(msg.text, index)} 
                          disabled={!!ttsLoading} 
                          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors disabled:opacity-50"
                        >
                            {ttsLoading === `tts-${index}` ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            ) : (
                                <SpeakerIcon className="w-5 h-5"/>
                            )}
                        </button>
                    </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-secondary text-white p-2.5 rounded-xl">
                  <LeafIcon className="w-5 h-5" />
              </div>
              <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce"></span>
                <span className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      <div className="p-4 md:p-6 bg-white border-t border-gray-100 shrink-0">
        <div className="container mx-auto w-full max-w-4xl relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chatbot.placeholder')}
            className="w-full pl-6 pr-20 py-4.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-gray-300 text-lg font-bold"
            disabled={loading}
          />
          <button 
            onClick={() => handleSend()} 
            disabled={loading || input.trim() === ''} 
            className="absolute right-2 top-2 bottom-2 bg-primary text-white w-14 rounded-xl hover:bg-green-700 disabled:bg-gray-200 shadow-lg shadow-primary/20 transition-all flex items-center justify-center group"
          >
            <SendIcon className="w-6 h-6 group-active:scale-90 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
