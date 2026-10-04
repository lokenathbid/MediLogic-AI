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
import AdminDashboardPage from './pages/AdminDashboardPage';

function AppContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activePage, setActivePage] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/admin' || path === '/admin/dashboard') {
      return 'admin';
    }
    return 'landing';
  });

  // Centralized page navigation with URL sync and patient name population
  const navigateTo = (page) => {
    if (page === 'symptoms') {
      const registeredName = profile?.name || user?.name || user?.user_metadata?.name;
      if (registeredName && (!patientInfo.name || !patientInfo.name.trim())) {
        setPatientInfo(prev => ({
          ...prev,
          name: registeredName,
          age: profile?.age || prev.age || 30,
          gender: (profile?.gender && profile.gender !== 'Unspecified') ? profile.gender : prev.gender
        }));
      }
    }

    if (page === 'admin') {
      if (!user) {
        setActivePage('auth');
        if (typeof window !== 'undefined') window.history.replaceState({}, '', '/');
        return;
      }
      if (profile && profile.role !== 'admin') {
        setActivePage('dashboard');
        if (typeof window !== 'undefined') window.history.replaceState({}, '', '/');
        return;
      }
      setActivePage('admin');
      if (typeof window !== 'undefined') window.history.replaceState({}, '', '/admin');
    } else {
      setActivePage(page);
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        if (path === '/admin' || path === '/admin/dashboard') {
          window.history.replaceState({}, '', '/');
        }
      }
    }
  };

  // Synchronize registered user's name into patientInfo whenever profile or user loads
  React.useEffect(() => {
    const registeredName = profile?.name || user?.name || user?.user_metadata?.name;
    if (registeredName && (!patientInfo.name || !patientInfo.name.trim())) {
      setPatientInfo(prev => ({
        ...prev,
        name: registeredName,
        age: profile?.age || prev.age || 30,
        gender: (profile?.gender && profile.gender !== 'Unspecified') ? profile.gender : prev.gender
      }));
    }
  }, [profile, user]);

  // Only check initial direct URL access to /admin on session load
  React.useEffect(() => {
    if (authLoading) return;
    const path = window.location.pathname.toLowerCase();
    const isAdminRoute = path === '/admin' || path === '/admin/dashboard';

    if (isAdminRoute) {
      if (!user) {
        setActivePage('auth');
        window.history.replaceState({}, '', '/');
      } else if (profile) {
        if (profile.role === 'admin') {
          setActivePage('admin');
        } else {
          setActivePage('dashboard');
          window.history.replaceState({}, '', '/');
        }
      }
    }
  }, [user, profile, authLoading]);
  
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
            setActivePage={navigateTo} 
            setSelectedSymptoms={setSelectedSymptoms} 
          />
        );
      case 'auth':
        return <AuthPage setActivePage={navigateTo} />;
      case 'dashboard':
        return (
          <DashboardPage 
            setActivePage={navigateTo}
            setSelectedSymptoms={setSelectedSymptoms}
            setSelectedReportForView={(report) => {
              setSelectedReportForView(report);
              navigateTo('results');
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
            setActivePage={navigateTo}
          />
        );
      case 'analysis':
        return (
          <DiagnosticEnginePage 
            selectedSymptoms={selectedSymptoms}
            patientInfo={patientInfo}
            setDiagnosticResult={setDiagnosticResult}
            setActivePage={navigateTo}
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
              navigateTo(page);
            }}
          />
        );
      case 'history':
        return (
          <HistoryPage 
            setActivePage={navigateTo}
            setSelectedReportForView={(report) => {
              setSelectedReportForView(report);
              navigateTo('results');
            }}
          />
        );
      case 'profile':
        return <ProfilePage setActivePage={navigateTo} />;
      case 'about':
        return <AboutPage setActivePage={navigateTo} />;
      case 'admin':
        if (!user) {
          return <AuthPage setActivePage={navigateTo} />;
        }
        if (profile && profile.role !== 'admin') {
          return (
            <DashboardPage 
              setActivePage={navigateTo}
              setSelectedSymptoms={setSelectedSymptoms}
              setSelectedReportForView={(report) => {
                setSelectedReportForView(report);
                navigateTo('results');
              }}
            />
          );
        }
        return (
          <AdminDashboardPage 
            setActivePage={navigateTo}
            setSelectedReportForView={(report) => {
              setSelectedReportForView(report);
              navigateTo('results');
            }}
          />
        );
      default:
        return <LandingPage setActivePage={navigateTo} setSelectedSymptoms={setSelectedSymptoms} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white relative">
      {/* Emergency & Educational Disclaimer Alert Bar */}
      <EmergencyBanner />

      {/* Main Top Navigation */}
      <Navbar 
        activePage={activePage} 
        setActivePage={navigateTo} 
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
      <Footer setActivePage={navigateTo} />
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

