
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
import CartModal from './components/CartModal';
import QRCodeModal from './components/QRCodeModal';
import { useAuth } from './context/AuthContext';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

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
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== productId));
    } else {
      setCartItems(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
    }
  };

  const clearCart = () => setCartItems([]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.RECOMMENDATION: return <RecommendationForm />;
      case Page.CROP_DOCTOR: return <CropDoctor />;
      case Page.CALCULATOR: return <FertilizerCalculator />;
      case Page.FARM_TASKS: return <FarmTasksPage />;
      case Page.STORE: return <Store addToCart={addToCart} />;
      case Page.CHECKOUT: return <CheckoutPage cartItems={cartItems} clearCart={clearCart} navigateTo={navigateTo} />;
      case Page.ORDER_HISTORY: return <OrderHistoryPage />;
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
          cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setIsCartOpen(true)}
        />
      )}
      <main className={`flex-grow ${!isChat ? 'pt-4' : ''}`}>{renderPage()}</main>
      {!isChat && <Footer />}
      
      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} 
        onUpdateQuantity={updateQuantity} 
        navigateTo={navigateTo}
      />
      <QRCodeModal isOpen={isQRCodeModalOpen} onClose={() => setIsQRCodeModalOpen(false)} />
    </div>
  );
};

export default App;
