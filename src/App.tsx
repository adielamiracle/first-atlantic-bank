import React, { useEffect } from 'react';
import { BankProvider, useBank } from './context/BankContext';
import { ToastContainer } from './components/common/ToastContainer';
import { BiometricPromptModal } from './components/common/BiometricPromptModal';
import { SmartsuppWidget } from './components/common/SmartsuppWidget';
import { PublicNavbar } from './components/layout/PublicNavbar';
import { PublicFooter } from './components/layout/PublicFooter';
import { CustomerSidebar } from './components/layout/CustomerSidebar';
import { CustomerHeader } from './components/layout/CustomerHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Public pages
import { HomePage } from './pages/public/HomePage';
import {
  PersonalPage,
  BusinessPage,
  WealthPage,
  InternationalPage,
  LocationsPage,
  SecurityPublicPage
} from './pages/public/PublicPages';

// Auth pages
import { LoginPage, EnrollPage } from './pages/auth/AuthPages';

// Dashboard pages
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { AccountDetailPage } from './pages/dashboard/AccountDetailPage';
import { TransfersPage } from './pages/dashboard/TransfersPage';
import { BillPayPage, CardsPage } from './pages/dashboard/CardsAndBillPay';
import {
  DepositCheckPage,
  StatementsPage,
  SecurityCenterPage,
  MessagesPage,
  ProfilePage
} from './pages/dashboard/CustomerFeatures';

// Admin dashboard & Login
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

const MainAppRouter: React.FC = () => {
  const { currentView, setCurrentView, isAuthenticated, currentRole } = useBank();

  // Handle explicit hash navigation (e.g. #admin-secure-portal or #admin) without trapping users on refresh
  useEffect(() => {
    // Check if this was a refresh (navigation type reload)
    const isPageReload = () => {
      try {
        const perfEntries = performance.getEntriesByType('navigation');
        if (perfEntries.length > 0) {
          const navTiming = perfEntries[0] as PerformanceNavigationTiming;
          return navTiming.type === 'reload';
        }
        return false;
      } catch {
        return false;
      }
    };

    if (isPageReload()) {
      // On browser reload/refresh, default to public front page and clear stale admin hash
      if (window.location.hash.toLowerCase().includes('admin')) {
        history.replaceState(null, document.title, window.location.pathname + window.location.search);
      }
      if (currentRole !== 'ADMIN' && !isAuthenticated) {
        setCurrentView('PUBLIC_HOME');
      }
    }

    const handleHashAndPath = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash === '#/admin' || hash === '#admin-secure-portal') {
        if (currentRole === 'ADMIN') {
          setCurrentView('ADMIN_DASHBOARD');
        } else {
          setCurrentView('AUTH_ADMIN_LOGIN');
        }
      }
    };

    window.addEventListener('hashchange', handleHashAndPath);

    // Keyboard shortcut for secure institutional admin entry: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.location.hash = 'admin-secure-portal';
        if (currentRole === 'ADMIN') {
          setCurrentView('ADMIN_DASHBOARD');
        } else {
          setCurrentView('AUTH_ADMIN_LOGIN');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashAndPath);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentRole, setCurrentView, isAuthenticated]);

  // 1. Dedicated Admin Authentication Route
  if (currentView === 'AUTH_ADMIN_LOGIN') {
    return <AdminLoginPage />;
  }

  // 2. Protected Institutional Admin View
  if (currentView === 'ADMIN_DASHBOARD') {
    if (currentRole === 'ADMIN') {
      return <AdminDashboard />;
    }
    return <AdminLoginPage />;
  }

  // 3. Authenticated Customer Dashboard Layout
  const isDashboardView =
    currentView.startsWith('DASHBOARD_') || (isAuthenticated && currentView === 'PUBLIC_HOME');

  if (isDashboardView && isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#07101e] text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
        {/* Persistent Desktop Sidebar */}
        <CustomerSidebar />

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <CustomerHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentView === 'DASHBOARD_OVERVIEW' && <DashboardOverview />}
            {currentView === 'DASHBOARD_ACCOUNT_DETAIL' && <AccountDetailPage />}
            {currentView === 'DASHBOARD_TRANSFERS' && <TransfersPage />}
            {currentView === 'DASHBOARD_BILLPAY' && <BillPayPage />}
            {currentView === 'DASHBOARD_CARDS' && <CardsPage />}
            {currentView === 'DASHBOARD_DEPOSIT' && <DepositCheckPage />}
            {currentView === 'DASHBOARD_STATEMENTS' && <StatementsPage />}
            {currentView === 'DASHBOARD_SECURITY' && <SecurityCenterPage />}
            {currentView === 'DASHBOARD_MESSAGES' && <MessagesPage />}
            {currentView === 'DASHBOARD_PROFILE' && <ProfilePage />}
          </main>
        </div>

        {/* Mobile Bottom Bar */}
        <MobileBottomNav />
      </div>
    );
  }

  // 4. Public & Customer Authentication Portal Layout
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#07101e] text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <PublicNavbar />
      <main className="flex-1">
        {currentView === 'PUBLIC_HOME' && <HomePage />}
        {currentView === 'PUBLIC_PERSONAL' && <PersonalPage />}
        {currentView === 'PUBLIC_BUSINESS' && <BusinessPage />}
        {currentView === 'PUBLIC_WEALTH' && <WealthPage />}
        {currentView === 'PUBLIC_INTERNATIONAL' && <InternationalPage />}
        {currentView === 'PUBLIC_LOCATIONS' && <LocationsPage />}
        {currentView === 'PUBLIC_SECURITY' && <SecurityPublicPage />}
        {currentView === 'AUTH_LOGIN' && <LoginPage />}
        {currentView === 'AUTH_ENROLL' && <EnrollPage />}
      </main>
      <PublicFooter />
    </div>
  );
};

const GlobalBiometricContainer: React.FC = () => {
  const { isBiometricModalOpen, closeBiometricPrompt, biometricModalConfig } = useBank();

  return (
    <BiometricPromptModal
      isOpen={isBiometricModalOpen}
      onClose={closeBiometricPrompt}
      onSuccess={(cred) => {
        if (biometricModalConfig?.onComplete) {
          biometricModalConfig.onComplete(true, cred);
        }
        closeBiometricPrompt();
      }}
      mode={biometricModalConfig?.mode || 'VERIFY'}
      title={biometricModalConfig?.title}
      subtitle={biometricModalConfig?.subtitle}
    />
  );
};

export function App() {
  return (
    <BankProvider>
      <div className="flex flex-col min-h-screen font-sans selection:bg-[#c5a880]/30 selection:text-slate-900 dark:selection:text-slate-100">
        {/* Global Toast Notification System */}
        <ToastContainer />

        {/* Global Biometric Scan Prompt Modal */}
        <GlobalBiometricContainer />

        {/* Smartsupp Live Chat & AI Concierge with 30s Idle Trigger & Push Alerts */}
        <SmartsuppWidget />

        {/* Core App View */}
        <MainAppRouter />
      </div>
    </BankProvider>
  );
}

export default App;
