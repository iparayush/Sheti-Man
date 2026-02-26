
import React from 'react';
import { LeafIcon } from './icons';

interface InsightCardProps {
  title: string;
  value: string;
  status?: string;
  statusType?: 'healthy' | 'warning' | 'neutral';
  icon: React.ReactNode;
}

export const InsightCard: React.FC<InsightCardProps> = ({ title, value, status, statusType = 'neutral', icon }) => (
  <div className="bg-white rounded-3xl p-5 border border-black/5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-primary/5 rounded-2xl text-primary">
        <div className="w-6 h-6">{icon}</div>
      </div>
      {status && (
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
          statusType === 'healthy' ? 'bg-emerald-100 text-emerald-700' : 
          statusType === 'warning' ? 'bg-orange-100 text-orange-700' : 
          'bg-gray-100 text-gray-700'
        }`}>
          {status}
        </span>
      )}
    </div>
    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</h3>
    <p className="text-2xl font-black text-dark mt-auto tracking-tighter">{value}</p>
  </div>
);

interface ExpertAdviceProps {
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const ExpertAdvice: React.FC<ExpertAdviceProps> = ({ title = "Expert Advice", children, icon }) => (
  <div className="relative overflow-hidden bg-[#F1F5F1] rounded-[2.5rem] p-8 border-l-8 border-primary shadow-sm">
    <div className="absolute top-[-20px] right-[-20px] opacity-5 text-primary pointer-events-none">
      {icon || <LeafIcon className="w-40 h-40" />}
    </div>
    <div className="absolute top-4 right-4 opacity-10 text-primary pointer-events-none">
      <LeafIcon className="w-8 h-8" />
    </div>
    <h4 className="font-serif italic text-2xl text-secondary mb-3 relative z-10">{title}</h4>
    <div className="text-sm leading-relaxed text-gray-700 font-medium relative z-10 prose prose-sm max-w-none italic">
      {children}
    </div>
  </div>
);

export const AiThinkingLoader: React.FC<{ label?: string }> = ({ label = "Analyzing..." }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <div className="w-20 h-20 bg-primary/20 rounded-full animate-ping absolute inset-0" />
      <div className="w-20 h-20 bg-primary/40 rounded-full animate-pulse relative flex items-center justify-center">
        <LeafIcon className="w-10 h-10 text-white animate-bounce" />
      </div>
    </div>
    <span className="text-sm font-black text-primary uppercase tracking-[0.3em] animate-pulse">{label}</span>
  </div>
);

export const ThinkingState: React.FC<{ label?: string }> = ({ label = "Analyzing..." }) => (
  <div className="flex gap-2 items-center px-6 py-3 bg-white rounded-full shadow-xl border border-primary/10">
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
    <span className="text-xs font-black text-primary uppercase tracking-widest ml-2">{label}</span>
  </div>
);
