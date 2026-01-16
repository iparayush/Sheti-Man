
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
      className="bg-white rounded-3xl shadow-sm p-4 flex flex-col items-center text-center cursor-pointer transform active:scale-95 transition-all duration-150 border border-gray-100 hover:border-primary/10 hover:shadow-md group h-full justify-center"
      onClick={onClick}
    >
      <div 
        className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-105"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <div className="w-6 h-6">
            {icon}
        </div>
      </div>
      <h3 className="text-[15px] font-black text-dark mb-1 tracking-tight leading-none text-center px-1">{title}</h3>
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-80 leading-none">{description}</p>
    </div>
  );
};

export default Card;
