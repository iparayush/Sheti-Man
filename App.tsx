
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
import QRCodeModal from './components/QRCodeModal';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  
  if (!user) return <LoginPage />;

  const navigateTo = (page: Page) => setCurrentPage(page);

  const renderPage = () => {
    switch (currentPage) {
      case Page.RECOMMENDATION: return <RecommendationForm />;
      case Page.CROP_DOCTOR: return <CropDoctor />;
      case Page.CALCULATOR: return <FertilizerCalculator />;
      case Page.FARM_TASKS: return <FarmTasksPage />;
      case Page.CHATBOT: return <Chatbot navigateTo={navigateTo} />;
      default: return <Dashboard navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {currentPage !== Page.CHATBOT && (
        <Header 
          showBackButton={currentPage !== Page.DASHBOARD} 
          onBack={() => navigateTo(Page.DASHBOARD)} 
          navigateTo={navigateTo} 
          onQRCodeClick={() => setIsQRCodeModalOpen(true)}
        />
      )}
      <main className="flex-grow">{renderPage()}</main>
      {currentPage !== Page.CHATBOT && <Footer />}
      <QRCodeModal
        isOpen={isQRCodeModalOpen}
        onClose={() => setIsQRCodeModalOpen(false)}
      />
    </div>
  );
};

export default App;
