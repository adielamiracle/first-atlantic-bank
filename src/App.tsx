import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
import { PrivacyPage, TermsPage } from './pages/public/LegalPages';

// Auth pages
import { LoginPage, EnrollPage, ForgotPasswordPage } from './pages/auth/AuthPages';

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

// Glassmorphism UI Kit & Vector Interface Showcase
import { GlassmorphicShowcase } from './components/glass/GlassmorphicShowcase';

// Route Guards (RBAC & Session Enforcers)
import { UserRoute, AdminRoute } from './components/common/RouteGuards';

const MainAppRouter: React.FC = () => {
  const location = useLocation();
  const { currentView, setCurrentView, isAuthenticated, currentRole } = useBank();

  useEffect(() => {
    if (location.pathname.startsWith('/transfer')) {
      if (currentView !== 'DASHBOARD_TRANSFERS') {
        setCurrentView('DASHBOARD_TRANSFERS');
      }
    }
  }, [location.pathname, currentView, setCurrentView]);

  // Handle explicit hash and path navigation with strict role checks
  useEffect(() => {
    const handleHashAndPath = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      // Legal & Privacy routes
      if (hash === '#privacy' || hash === '#/privacy' || pathname === '/privacy') {
        setCurrentView('PUBLIC_PRIVACY');
        return;
      }
      if (hash === '#terms' || hash === '#/terms' || pathname === '/terms') {
        setCurrentView('PUBLIC_TERMS');
        return;
      }

      // Password recovery route
      if (
        hash === '#forgot' ||
        hash === '#/forgot' ||
        hash === '#forgot-password' ||
        pathname === '/forgot' ||
        pathname === '/forgot-password'
      ) {
        setCurrentView('AUTH_FORGOT_PASSWORD');
        return;
      }

      // Transfer routes (/transfer, /transfer/amount, etc.)
      if (
        pathname.startsWith('/transfer') ||
        hash.startsWith('#/transfer') ||
        hash.startsWith('#transfer')
      ) {
        setCurrentView('DASHBOARD_TRANSFERS');
        return;
      }

      // Admin routes with strict Role-Based Access Control
      if (
        hash.includes('admin') ||
        pathname.includes('admin') ||
        hash === '#admin' ||
        hash === '#/admin' ||
        pathname === '/admin' ||
        pathname.startsWith('/admin') ||
        hash === '#admin-secure-portal' ||
        hash === '#portal-admin'
      ) {
        // HIDE COMPLETELY FOR NORMAL USERS:
        if (currentRole === 'CUSTOMER') {
          // Normal user guessed /admin -> Keep hidden, redirect to customer dashboard
          setCurrentView('DASHBOARD_OVERVIEW');
        } else if (currentRole === 'ADMIN') {
          setCurrentView('ADMIN_DASHBOARD');
        } else {
          setCurrentView('AUTH_ADMIN_LOGIN');
        }
      }
    };

    // Check on initial load immediately
    handleHashAndPath();

    window.addEventListener('hashchange', handleHashAndPath);

    // Keyboard shortcut for secure institutional admin entry: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (currentRole === 'ADMIN') {
          window.location.hash = 'admin';
          setCurrentView('ADMIN_DASHBOARD');
        } else if (currentRole !== 'CUSTOMER') {
          window.location.hash = 'admin';
          setCurrentView('AUTH_ADMIN_LOGIN');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashAndPath);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentRole, setCurrentView]);

  // 1. Dedicated Admin Authentication Route - Hide completely for normal users
  if (currentView === 'AUTH_ADMIN_LOGIN') {
    if (currentRole === 'CUSTOMER') {
      setCurrentView('DASHBOARD_OVERVIEW');
      return null;
    }
    return <AdminLoginPage />;
  }

  // 2. Protected Institutional Admin View - Strictly accessible only to ADMIN role
  if (currentView === 'ADMIN_DASHBOARD' || currentView.startsWith('ADMIN_')) {
    return (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    );
  }

  // 3. Authenticated Customer Dashboard Layout (Protected by UserRoute)
  const isDashboardView =
    currentView.startsWith('DASHBOARD_') || (isAuthenticated && currentView === 'PUBLIC_HOME');

  if (isDashboardView) {
    return (
      <UserRoute>
        <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#07101e] text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200 overflow-x-hidden">
          {/* Ambient Glassmorphic Background Glowing Meshes */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-amber-500/10 dark:bg-amber-600/10 blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-500/8 dark:bg-indigo-700/12 blur-3xl" />
          </div>

          {/* Persistent Desktop Sidebar */}
          <CustomerSidebar />

          {/* Main Content Pane */}
          <div className="relative z-10 flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
            <CustomerHeader />
            <main className="flex-1 p-2.5 xs:p-3.5 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto overflow-x-hidden min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
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
                  {currentView === 'DASHBOARD_GLASS_STUDIO' && <GlassmorphicShowcase />}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          {/* Mobile Bottom Bar */}
          <MobileBottomNav />
        </div>
      </UserRoute>
    );
  }

  // 4. Public & Customer Authentication Portal Layout
  return (
    <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#07101e] text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200 overflow-x-hidden">
      {/* Ambient Glassmorphic Background Glowing Meshes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-[450px] h-[450px] rounded-full bg-amber-500/10 dark:bg-amber-600/10 blur-3xl" />
        <div className="absolute -bottom-32 left-10 w-[550px] h-[550px] rounded-full bg-indigo-500/8 dark:bg-indigo-800/12 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <PublicNavbar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full"
            >
              {currentView === 'PUBLIC_HOME' && <HomePage />}
              {currentView === 'PUBLIC_PERSONAL' && <PersonalPage />}
              {currentView === 'PUBLIC_BUSINESS' && <BusinessPage />}
              {currentView === 'PUBLIC_WEALTH' && <WealthPage />}
              {currentView === 'PUBLIC_INTERNATIONAL' && <InternationalPage />}
              {currentView === 'PUBLIC_LOCATIONS' && <LocationsPage />}
              {currentView === 'PUBLIC_SECURITY' && <SecurityPublicPage />}
              {currentView === 'PUBLIC_GLASS_STUDIO' && (
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                  <GlassmorphicShowcase />
                </div>
              )}
              {currentView === 'AUTH_LOGIN' && <LoginPage />}
              {currentView === 'AUTH_ENROLL' && <EnrollPage />}
              {(currentView === 'AUTH_FORGOT' || (currentView as any) === 'AUTH_FORGOT_PASSWORD') && <ForgotPasswordPage />}
              {currentView === 'PUBLIC_PRIVACY' && <PrivacyPage />}
              {currentView === 'PUBLIC_TERMS' && <TermsPage />}
            </motion.div>
          </AnimatePresence>
        </main>
        <PublicFooter />
      </div>
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
