import React, { useEffect, useRef } from 'react';
import { useLocalization } from '../context/LocalizationContext';

declare const QRCode: any;

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocalization();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, window.location.href, { width: 256, margin: 2 }, (error: Error | null) => {
        if (error) console.error(error);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6 text-center" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-secondary">{t('qrCodeModal.title')}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-light">&times;</button>
        </div>
        
        <div className="flex justify-center my-6">
            <canvas ref={canvasRef} className="rounded-lg"></canvas>
        </div>

        <p className="text-gray-600">{t('qrCodeModal.instruction')}</p>
      </div>
    </div>
  );
};

export default QRCodeModal;
