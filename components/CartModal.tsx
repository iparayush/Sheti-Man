
import React, { useState } from 'react';
import { CartItem, Page } from '../types';
import { LeafIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';

interface CartModalProps {
  cartItems: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  navigateTo: (page: Page) => void;
}

const CartModal: React.FC<CartModalProps> = ({ cartItems, isOpen, onClose, onUpdateQuantity, navigateTo }) => {
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const { t } = useLocalization();

  if (!isOpen) return null;

  const handleRemove = (productId: number) => {
    setRemovingItemId(productId);
    setTimeout(() => {
      onUpdateQuantity(productId, 0);
      setRemovingItemId(null);
    }, 300); // Match animation duration
  };

  const handleQuantityChange = (productId: number, value: string) => {
    const newQuantity = parseInt(value, 10);
    // Enforce positive numbers only. Invalid or empty input defaults to 1.
    onUpdateQuantity(productId, Math.max(1, newQuantity || 1));
  };

  const handleCheckout = () => {
    onClose();
    navigateTo(Page.CHECKOUT);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-secondary">{t('cart.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-light">&times;</button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <LeafIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t('cart.empty')}</p>
              <p className="text-sm text-gray-400">{t('cart.emptyHint')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between py-2 border-b last:border-b-0 transition-all duration-300 ease-in-out ${removingItemId === item.id ? 'opacity-0 transform -translate-x-8' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-4">
                     <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                     <div>
                       <h3 className="font-semibold text-gray-800">{item.name}</h3>
                       <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} {t('cart.each')}</p>
                       <button onClick={() => handleRemove(item.id)} className="text-xs text-red-500 hover:underline">{t('cart.remove')}</button>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-16 p-1 border rounded text-center"
                      min="1"
                    />
                    <span className="font-semibold w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="p-4 border-t bg-gray-50 rounded-b-lg">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>{t('cart.total')}</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-primary text-white py-3 rounded-md hover:bg-green-700 transition-colors font-semibold"
            >
              {t('cart.checkout')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;