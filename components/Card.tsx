import React from 'react';

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

const Card: React.FC<CardProps> = ({ title, description, icon, onClick, color = '#388E3C' }) => {
  return (
    <div 
      className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center text-center cursor-pointer transform active:scale-95 transition-all duration-150 border border-gray-100 hover:border-primary/10 hover:shadow-md group"
      onClick={onClick}
    >
      <div 
        className="w-14 h-14 rounded-xl mb-4 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-105"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <div className="w-7 h-7">
            {icon}
        </div>
      </div>
      <h3 className="text-lg font-black text-dark mb-1.5 tracking-tight leading-none">{title}</h3>
      <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest opacity-80 leading-none">{description}</p>
    </div>
  );
};

export default Card;