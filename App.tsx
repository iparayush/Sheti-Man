
import React, { useState, useEffect, useCallback } from 'react';
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
import QRCodeModal from './components/QRCodeModal';
import CartModal from './components/CartModal';
import { useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import Spinner from './components/Spinner';
import { testOpenRouterConnection } from './services/geminiService';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const verifyApi = useCallback(async () => {
    setIsRetrying(true);
    setApiError(null);
    const result = await testOpenRouterConnection();
    if (!result.success) {
      setApiError(result.message);
    }
    setIsRetrying(false);
  }, []);

  useEffect(() => {
    verifyApi();
  }, [verifyApi]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Spinner /></div>;
  if (!user) return <LoginPage />;

  const navigateTo = (page: Page) => setCurrentPage(page);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: number, qty: number) => {
    setCartItems(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
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
  
  // विशिष्ट त्रुटींनुसार लिंक्स ठरवणे
  const isQuotaError = apiError?.toLowerCase().includes('quota') || apiError?.toLowerCase().includes('कोटा');
  const isKeyError = apiError?.toLowerCase().includes('key') || apiError?.toLowerCase().includes('की');
  const isOpenRouterLink = apiError?.toLowerCase().includes('openrouter');

  return (
    <ProductProvider>
      <OrderProvider>
        <div className="flex flex-col min-h-screen bg-background relative">
          {apiError && !isChat && (
            <div className="bg-red-600 text-white text-[11px] py-2.5 px-4 font-bold flex flex-wrap gap-2 justify-between items-center z-[100] sticky top-0 shadow-lg animate-fade-in">
              <div className="flex-1 flex items-center gap-2">
                <span className="shrink-0 text-base">⚠️</span>
                <span>{apiError}</span>
              </div>
              <div className="flex items-center gap-2">
                {isQuotaError && (
                  <a href="https://aistudio.google.com/app/plan_billing" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors whitespace-nowrap">
                    Google AI Studio
                  </a>
                )}
                {isOpenRouterLink && (
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors whitespace-nowrap">
                    OpenRouter Keys
                  </a>
                )}
                <button 
                  onClick={verifyApi} 
                  disabled={isRetrying}
                  className="bg-white text-red-600 px-3 py-1 rounded-md uppercase tracking-tighter hover:bg-gray-100 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isRetrying ? "Checking..." : "Retry"}
                </button>
                <button 
                  onClick={() => setApiError(null)} 
                  className="p-1 hover:bg-white/10 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {!isChat && (
            <Header 
              showBackButton={currentPage !== Page.DASHBOARD} 
              onBack={() => navigateTo(Page.DASHBOARD)} 
              navigateTo={navigateTo} 
              onQRCodeClick={() => setIsQRCodeModalOpen(true)}
            />
          )}

          <main className={`flex-grow ${!isChat ? 'pt-4' : ''}`}>{renderPage()}</main>
          
          {currentPage === Page.STORE && (
            <button 
              onClick={() => setIsCartOpen(true)}
              className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-2xl z-40 flex items-center gap-2 hover:scale-110 transition-transform active:scale-90"
            >
              <span className="font-bold">{cartItems.length}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          )}

          {!isChat && <Footer />}
          
          <QRCodeModal isOpen={isQRCodeModalOpen} onClose={() => setIsQRCodeModalOpen(false)} />
          <CartModal 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            cartItems={cartItems} 
            onUpdateQuantity={updateCartQuantity} 
            navigateTo={navigateTo} 
          />
        </div>
      </OrderProvider>
    </ProductProvider>
  );
};

export default App;
