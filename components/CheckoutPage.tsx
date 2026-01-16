
import React, { useState } from 'react';
import { CartItem, Page } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

interface CheckoutPageProps {
  cartItems: CartItem[];
  clearCart: () => void;
  navigateTo: (page: Page) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, clearCart, navigateTo }) => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    pincode: '',
  });
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    addOrder({
      items: cartItems,
      total,
      customerName: shippingInfo.name,
      shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.pincode}`,
      status: 'Pending',
    });
    
    clearCart();
    setIsOrderPlaced(true);
  };

  if (isOrderPlaced) {
    return (
        <div className="max-w-2xl mx-auto p-8 text-center">
            <div className="bg-white p-10 rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold text-primary mb-4">{t('checkoutPage.orderPlacedSuccess')}</h2>
                <p className="text-gray-600 mb-6">{t('checkoutPage.orderPlacedDescription')}</p>
                <button 
                    onClick={() => navigateTo(Page.DASHBOARD)}
                    className="bg-primary text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
                >
                    {t('checkoutPage.backToDashboardButton')}
                </button>
            </div>
        </div>
    );
  }

  if (cartItems.length === 0) {
    return (
        <div className="max-w-2xl mx-auto p-8 text-center">
             <div className="bg-white p-10 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold text-secondary mb-4">{t('checkoutPage.cartEmpty')}</h2>
                 <button 
                    onClick={() => navigateTo(Page.STORE)}
                    className="bg-primary text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
                >
                    {t('store.title')}
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-secondary mb-6 text-center">{t('checkoutPage.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-secondary mb-4">{t('checkoutPage.shippingTitle')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('checkoutPage.fullNameLabel')}</label>
              <input type="text" name="name" id="name" value={shippingInfo.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">{t('checkoutPage.addressLabel')}</label>
              <input type="text" name="address" id="address" value={shippingInfo.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">{t('checkoutPage.cityLabel')}</label>
              <input type="text" name="city" id="city" value={shippingInfo.city} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">{t('checkoutPage.pincodeLabel')}</label>
              <input type="text" name="pincode" id="pincode" value={shippingInfo.pincode} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-3 rounded-md hover:bg-green-700 transition-colors font-semibold mt-4">
              {t('checkoutPage.placeOrderButton')} (₹{total.toFixed(2)})
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-secondary mb-4">{t('checkoutPage.summaryTitle')}</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity} x ₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
                <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between font-bold text-lg">
              <span>{t('cart.total')}</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;