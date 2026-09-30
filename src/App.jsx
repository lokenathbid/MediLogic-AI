import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EmergencyBanner from './components/EmergencyBanner';
import AskAiDrawer from './components/AskAiDrawer';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SymptomSelectionPage from './pages/SymptomSelectionPage';
import DiagnosticEnginePage from './pages/DiagnosticEnginePage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';

function AppContent() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('landing');
  
  // Global Ask AI Drawer State
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);

  // Shared Diagnostic Workflow State
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: 30,
    gender: 'Unspecified'
  });
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [selectedReportForView, setSelectedReportForView] = useState(null);

  const renderActivePage = () => {
    switch (activePage) {
      case 'landing':
        return (
          <LandingPage 
            setActivePage={setActivePage} 
            setSelectedSymptoms={setSelectedSymptoms} 
          />
        );
      case 'auth':
        return <AuthPage setActivePage={setActivePage} />;
      case 'dashboard':
        return (
          <DashboardPage 
            setActivePage={setActivePage}
            setSelectedSymptoms={setSelectedSymptoms}
            setSelectedReportForView={(report) => {
              setSelectedReportForView(report);
              setActivePage('results');
            }}
          />
        );
      case 'symptoms':
        return (
          <SymptomSelectionPage 
            selectedSymptoms={selectedSymptoms}
            setSelectedSymptoms={setSelectedSymptoms}
            patientInfo={patientInfo}
            setPatientInfo={setPatientInfo}
            setActivePage={setActivePage}
          />
        );
      case 'analysis':
        return (
          <DiagnosticEnginePage 
            selectedSymptoms={selectedSymptoms}
            patientInfo={patientInfo}
            setDiagnosticResult={setDiagnosticResult}
            setActivePage={setActivePage}
          />
        );
      case 'results':
        return (
          <ResultsPage 
            diagnosticResult={diagnosticResult}
            selectedSymptoms={selectedSymptoms}
            patientInfo={patientInfo}
            viewOnlyReport={selectedReportForView}
            onOpenAskAi={() => setIsAskAiOpen(true)}
            setActivePage={(page) => {
              if (page !== 'results') {
                setSelectedReportForView(null);
              }
              setActivePage(page);
            }}
          />
        );
      case 'history':
        return (
          <HistoryPage 
            setActivePage={setActivePage}
            setSelectedReportForView={(report) => {
              setSelectedReportForView(report);
              setActivePage('results');
            }}
          />
        );
      case 'profile':
        return <ProfilePage setActivePage={setActivePage} />;
      case 'about':
        return <AboutPage setActivePage={setActivePage} />;
      default:
        return <LandingPage setActivePage={setActivePage} setSelectedSymptoms={setSelectedSymptoms} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white relative">
      {/* Emergency & Educational Disclaimer Alert Bar */}
      <EmergencyBanner />

      {/* Main Top Navigation */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isAskAiOpen={isAskAiOpen}
        onToggleAskAi={() => setIsAskAiOpen(!isAskAiOpen)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderActivePage()}
      </main>

      {/* Global Ask AI Sliding Right Drawer (No backdrop, No page scrolling) */}
      <AskAiDrawer 
        isOpen={isAskAiOpen}
        onClose={() => setIsAskAiOpen(false)}
        activePage={activePage}
        selectedSymptoms={selectedSymptoms}
        diagnosticResult={diagnosticResult}
        selectedReportForView={selectedReportForView}
        patientInfo={patientInfo}
      />

      {/* Footer */}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

