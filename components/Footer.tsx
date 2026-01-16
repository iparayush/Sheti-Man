import React from 'react';
import { useLocalization } from '../context/LocalizationContext';

const Footer: React.FC = () => {
  const { t } = useLocalization();
  return (
    <footer className="bg-secondary text-white py-4 mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} {t('footer.text')}</p>
      </div>
    </footer>
  );
};

export default Footer;