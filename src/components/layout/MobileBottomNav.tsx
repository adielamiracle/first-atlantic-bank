import React, { useState } from 'react';
import {
  Home,
  Landmark,
  Send,
  Receipt,
  MoreHorizontal,
  CreditCard,
  Camera,
  FileText,
  ShieldCheck,
  MessageSquare,
  User,
  X,
  Wallet
} from 'lucide-react';
import { useBank, AppView } from '../../context/BankContext';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView } = useBank();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const mainTabs: { label: string; view: AppView; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Home', view: 'DASHBOARD_OVERVIEW', icon: Home },
    { label: 'Accounts', view: 'DASHBOARD_ACCOUNT_DETAIL', icon: Landmark },
    { label: 'Pay', view: 'DASHBOARD_TRANSFERS', icon: Send },
    { label: 'Activity', view: 'DASHBOARD_STATEMENTS', icon: Receipt },
  ];

  const moreItems: { label: string; view: AppView; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Bill Pay & Remittance', view: 'DASHBOARD_BILLPAY', icon: Receipt },
    { label: 'Cards & Spend Controls', view: 'DASHBOARD_CARDS', icon: CreditCard },
    { label: 'Mobile Check Deposit', view: 'DASHBOARD_DEPOSIT', icon: Camera },
    { label: 'Statements & Tax', view: 'DASHBOARD_STATEMENTS', icon: FileText },
    { label: 'Security & Biometrics', view: 'DASHBOARD_SECURITY', icon: ShieldCheck },
    { label: 'Private Concierge AI', view: 'DASHBOARD_MESSAGES', icon: MessageSquare },
    { label: 'Profile & Settings', view: 'DASHBOARD_PROFILE', icon: User }
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#071322] border-t border-slate-200/90 dark:border-slate-800/90 px-3 py-2 flex items-center justify-around transition-colors shadow-lg">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.view;
          return (
            <button
              key={tab.view}
              onClick={() => {
                setCurrentView(tab.view);
                setMoreSheetOpen(false);
              }}
              className={`flex flex-col items-center py-0.5 px-2.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'text-[#d97706] dark:text-[#f8c22d]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'text-[#d97706] dark:text-[#f8c22d]' : 'text-slate-500 dark:text-slate-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="leading-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* More Tab */}
        <button
          onClick={() => setMoreSheetOpen(!moreSheetOpen)}
          className={`flex flex-col items-center py-0.5 px-2.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
            moreSheetOpen
              ? 'text-[#d97706] dark:text-[#f8c22d]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-full ${moreSheetOpen ? 'text-[#d97706] dark:text-[#f8c22d]' : 'text-slate-500 dark:text-slate-400'}`}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="leading-tight">More</span>
        </button>
      </nav>

      {/* Bottom Sheet for More Actions */}
      {moreSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white dark:bg-[#0c1f36] rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 dark:border-[#1e3656] max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                First Atlantic Banking Services
              </h3>
              <button
                onClick={() => setMoreSheetOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 py-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      setCurrentView(item.view);
                      setMoreSheetOpen(false);
                    }}
                    className="flex flex-col items-start p-3.5 rounded-2xl bg-slate-50 dark:bg-[#071322] hover:bg-amber-50/50 dark:hover:bg-[#0a1b30] border border-slate-200/80 dark:border-[#1e3656] transition-all text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#f8c22d] text-slate-950 flex items-center justify-center mb-2 shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

