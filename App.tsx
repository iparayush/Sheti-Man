
import React, { useState } from 'react';
import { Page, Product, CartItem } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import RecommendationForm from './components/RecommendationForm';
import CropDoctor from './components/CropDoctor';
import FertilizerCalculator from './components/FertilizerCalculator';
import Chatbot from './components/Chatbot';
import LoginPage from './components/LoginPage';
import FarmTasksPage from './components/FarmTasksPage';
import Store from './components/Store';
import CheckoutPage from './components/CheckoutPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import SupplierDashboard from './components/SupplierDashboard';
import CartModal from './components/CartModal';
import QRCodeModal from './components/QRCodeModal';
import { useAuth } from './context/AuthContext';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const navigateTo = (page: Page) => setCurrentPage(page);

  // Cart logic implementation
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartModalOpen(true);
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    setCartItems(prev => {
      if (newQuantity <= 0) return prev.filter(item => item.id !== productId);
      return prev.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
    });
  };

  const clearCart = () => setCartItems([]);

  const renderPage = () => {
    // Redirect suppliers to their dashboard by default
    if (user.role === 'supplier' && currentPage === Page.DASHBOARD) {
        return <SupplierDashboard />;
    }

    switch (currentPage) {
      case Page.RECOMMENDATION: return <RecommendationForm />;
      case Page.CROP_DOCTOR: return <CropDoctor />;
      case Page.CALCULATOR: return <FertilizerCalculator />;
      case Page.FARM_TASKS: return <FarmTasksPage />;
      case Page.CHATBOT: return <Chatbot navigateTo={navigateTo} />;
      case Page.STORE: return <Store addToCart={addToCart} />;
      case Page.CHECKOUT: return <CheckoutPage cartItems={cartItems} clearCart={clearCart} navigateTo={navigateTo} />;
      case Page.ORDER_HISTORY: return <OrderHistoryPage />;
      case Page.SUPPLIER_DASHBOARD: return <SupplierDashboard />;
      default: return <Dashboard navigateTo={navigateTo} />;
    }
  };

  const isChat = currentPage === Page.CHATBOT;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!isChat && (
        <Header 
          showBackButton={currentPage !== Page.DASHBOARD} 
          onBack={() => navigateTo(Page.DASHBOARD)} 
          navigateTo={navigateTo} 
          onQRCodeClick={() => setIsQRCodeModalOpen(true)}
        />
      )}

      {/* Cart trigger for non-checkout pages */}
      {!isChat && cartItems.length > 0 && currentPage !== Page.CHECKOUT && (
        <button 
          onClick={() => setIsCartModalOpen(true)}
          className="fixed bottom-24 right-6 bg-primary text-white p-4 rounded-full shadow-2xl z-40"
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
        </button>
      )}

      <main className={`flex-grow ${!isChat ? 'pt-4' : ''}`}>{renderPage()}</main>
      {!isChat && <Footer />}
      
      <CartModal 
        isOpen={isCartModalOpen} 
        onClose={() => setIsCartModalOpen(false)} 
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        navigateTo={navigateTo}
      />

      <QRCodeModal isOpen={isQRCodeModalOpen} onClose={() => setIsQRCodeModalOpen(false)} />
    </div>
  );
};

export default App;
