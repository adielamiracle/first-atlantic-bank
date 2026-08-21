import React from 'react';
import { BankProvider, useBank } from './context/BankContext';
import { DemoSandboxBar } from './components/common/DemoSandboxBar';
import { ToastContainer } from './components/common/ToastContainer';
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

// Admin dashboard
import { AdminDashboard } from './pages/admin/AdminDashboard';

const MainAppRouter: React.FC = () => {
  const { currentView, isAuthenticated } = useBank();

  // 1. Institutional Admin View
  if (currentView === 'ADMIN_DASHBOARD') {
    return <AdminDashboard />;
  }

  // 2. Authenticated Customer Dashboard Layout
  const isDashboardView =
    currentView.startsWith('DASHBOARD_') || (isAuthenticated && currentView === 'PUBLIC_HOME');

  if (isDashboardView && isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row">
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

  // 3. Public & Authentication Portal Layout
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
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

export function App() {
  return (
    <BankProvider>
      <div className="flex flex-col min-h-screen font-sans selection:bg-[#c5a880]/30 selection:text-slate-900">
        {/* Sandbox Demonstration Header & Quick Switcher */}
        <DemoSandboxBar />

        {/* Global Toast Notification System */}
        <ToastContainer />

        {/* Core App View */}
        <MainAppRouter />
      </div>
    </BankProvider>
  );
}

export default App;
