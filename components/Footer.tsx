
import React from 'react';
import { useLocalization } from '../context/LocalizationContext';

const Footer: React.FC = () => {
  const { t } = useLocalization();
  return (
    <footer className="bg-[#1A231F] text-white/40 py-4 mt-6 border-t border-white/5">
      <div className="container mx-auto px-4 text-center">
        <p className="text-[10px] font-black tracking-[0.15em] uppercase text-white/60">
          {t('footer.text')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
