
import React, { useState, useEffect, useCallback } from 'react';
import { Page, Product, CartItem } from './types';
import Header from './components/Header';
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
import GovernmentSchemes from './components/GovernmentSchemes';
import SoilAnalyzer from './components/SoilAnalyzer';
import MarketPrices from './components/MarketPrices';
import MyCrops from './components/MyCrops';
import ProfilePage from './components/ProfilePage';
import BottomNavigation from './components/BottomNavigation';
import QRCodeModal from './components/QRCodeModal';
import CartModal from './components/CartModal';
import { useAuth } from './context/AuthContext';
import Spinner from './components/Spinner';
import { verifyAiStatus } from './services/geminiService';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const [pageHistory, setPageHistory] = useState<Page[]>([]);

  const checkAiConnection = useCallback(async () => {
    setIsRetrying(true);
    setApiError(null);
    try {
      const result = await verifyAiStatus();
      if (!result.success) {
        setApiError(result.message);
      }
    } catch (e: any) {
      setApiError(e.message || "AI connection failed.");
    } finally {
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    if (user) checkAiConnection();
  }, [user, checkAiConnection]);

  const navigateTo = useCallback((page: Page) => {
    setPageHistory(prev => [...prev, currentPage]);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, [currentPage]);

  const goBack = useCallback(() => {
    if (pageHistory.length > 0) {
      const prevPage = pageHistory[pageHistory.length - 1];
      setPageHistory(prev => prev.slice(0, -1));
      setCurrentPage(prevPage);
    } else {
      setCurrentPage(Page.DASHBOARD);
    }
  }, [pageHistory]);

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
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== productId));
    } else {
      setCartItems(prev => prev.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const clearCart = () => setCartItems([]);

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  if (!user) return <LoginPage />;

  const renderPage = () => {
    switch (currentPage) {
      case Page.DASHBOARD: return <Dashboard navigateTo={navigateTo} />;
      case Page.RECOMMENDATION: return <RecommendationForm />;
      case Page.CROP_DOCTOR: return <CropDoctor />;
      case Page.CALCULATOR: return <FertilizerCalculator />;
      case Page.CHATBOT: return <Chatbot navigateTo={navigateTo} />;
      case Page.FARM_TASKS: return <FarmTasksPage />;
      case Page.STORE: return <Store addToCart={addToCart} />;
      case Page.CHECKOUT: return <CheckoutPage cartItems={cartItems} clearCart={clearCart} navigateTo={navigateTo} />;
      case Page.ORDER_HISTORY: return <OrderHistoryPage />;
      case Page.GOVERNMENT_SCHEMES: return <GovernmentSchemes />;
      case Page.MARKET_PRICES: return <MarketPrices />;
      case Page.SOIL_ANALYZER: return <SoilAnalyzer />;
      case Page.MY_CROPS: return <MyCrops />;
      case Page.PROFILE: return <ProfilePage />;
      default: return <Dashboard navigateTo={navigateTo} />;
    }
  };

  const showBackButton = currentPage !== Page.DASHBOARD;
  
  // Clean up error message for display
  const displayError = apiError?.replace("QUOTA_EXCEEDED: ", "").replace("AUTH_ERROR: ", "");

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col font-sans relative">
      {apiError && currentPage !== Page.CHATBOT && (
        <div className={`text-white text-[11px] py-2.5 px-4 font-bold flex flex-wrap gap-2 justify-between items-center z-[100] sticky top-0 shadow-lg animate-fade-in ${apiError.includes('AUTH_ERROR') ? 'bg-orange-600' : 'bg-red-600'}`}>
          <div className="flex-1 flex items-center gap-2">
            <span className="shrink-0 text-base">{apiError.includes('AUTH_ERROR') ? '🔑' : '⚠️'}</span>
            <div className="flex flex-col">
               <span className="leading-tight">{displayError}</span>
               {apiError.includes('AUTH_ERROR') && (
                 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-[9px] opacity-90 mt-0.5">
                   Get your API Key from Google AI Studio
                 </a>
               )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={checkAiConnection} 
              disabled={isRetrying}
              className="bg-white text-dark px-3 py-1 rounded-md uppercase tracking-tighter hover:bg-gray-100 disabled:opacity-50 transition-all active:scale-95"
            >
              {isRetrying ? "Verifying..." : "Retry"}
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

      <Header 
        onBack={goBack} 
        showBackButton={showBackButton} 
        navigateTo={navigateTo} 
        onQRCodeClick={() => setIsQRCodeModalOpen(true)} 
      />
      
      <main className="flex-grow">
        {renderPage()}
      </main>

      <BottomNavigation currentPage={currentPage} onNavigate={navigateTo} />
      
      <QRCodeModal isOpen={isQRCodeModalOpen} onClose={() => setIsQRCodeModalOpen(false)} />
      <CartModal 
        isOpen={isCartModalOpen} 
        onClose={() => setIsCartModalOpen(false)} 
        cartItems={cartItems} 
        onUpdateQuantity={updateQuantity} 
        navigateTo={navigateTo}
      />
    </div>
  );
};

export default App;
