import React, { useState } from 'react';
import { Page } from './types';
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
import QRCodeModal from './components/QRCodeModal';
import { useAuth } from './context/AuthContext';
import { CartItem, Product } from './types';

const App: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  if (!user) return <LoginPage />;

  const navigateTo = (page: Page) => setCurrentPage(page);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCartItems(prev => {
      if (quantity <= 0) return prev.filter(item => item.id !== productId);
      return prev.map(item => item.id === productId ? { ...item, quantity } : item);
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.RECOMMENDATION: return <RecommendationForm />;
      case Page.CROP_DOCTOR: return <CropDoctor />;
      case Page.CALCULATOR: return <FertilizerCalculator />;
      case Page.FARM_TASKS: return <FarmTasksPage />;
      case Page.STORE: return <Store addToCart={addToCart} />;
      case Page.CHECKOUT: return <CheckoutPage cartItems={cartItems} clearCart={() => setCartItems([])} navigateTo={navigateTo} />;
      case Page.ORDERS: return <OrderHistoryPage />;
      case Page.CHATBOT: return <Chatbot navigateTo={navigateTo} />;
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
          cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
          onCartClick={() => navigateTo(Page.STORE)}
        />
      )}
      <main className={`flex-grow ${!isChat ? 'pt-4' : ''}`}>{renderPage()}</main>
      {!isChat && <Footer />}
      <QRCodeModal isOpen={isQRCodeModalOpen} onClose={() => setIsQRCodeModalOpen(false)} />
    </div>
  );
};

export default App;