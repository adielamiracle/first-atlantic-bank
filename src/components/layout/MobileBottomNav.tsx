import React, { useState } from 'react';
import {
  Home,
  Landmark,
  Send,
  FileText,
  MoreHorizontal,
  CreditCard,
  Camera,
  ShieldCheck,
  User,
  X,
  Receipt,
  Sparkles,
  Bot
} from 'lucide-react';
import { useBank, AppView } from '../../context/BankContext';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView } = useBank();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const navTabs: { id: string; label: string; view?: AppView; icon: React.ComponentType<{ className?: string }>; isMore?: boolean }[] = [
    { id: 'home', label: 'Home', view: 'DASHBOARD_OVERVIEW', icon: Home },
    { id: 'accounts', label: 'Accounts', view: 'DASHBOARD_ACCOUNT_DETAIL', icon: Landmark },
    { id: 'pay', label: 'Pay', view: 'DASHBOARD_TRANSFERS', icon: (props: any) => <Send {...props} className={`${props.className || ''} rotate-45`} /> },
    { id: 'activity', label: 'Activity', view: 'DASHBOARD_STATEMENTS', icon: FileText },
    { id: 'more', label: 'More', isMore: true, icon: MoreHorizontal },
  ];

  const moreItems: { label: string; view: AppView; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'First Atlantic AI', view: 'DASHBOARD_MESSAGES', icon: Bot },
    { label: 'Bill Pay & Utilities', view: 'DASHBOARD_BILLPAY', icon: Receipt },
    { label: 'Cards & Limits', view: 'DASHBOARD_CARDS', icon: CreditCard },
    { label: 'Mobile Check Deposit', view: 'DASHBOARD_DEPOSIT', icon: Camera },
    { label: 'Security & Biometrics', view: 'DASHBOARD_SECURITY', icon: ShieldCheck },
    { label: 'Glass UI Kit & Media', view: 'DASHBOARD_GLASS_STUDIO', icon: Sparkles },
    { label: 'Profile & Settings', view: 'DASHBOARD_PROFILE', icon: User }
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#121212] border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 transition-colors shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.isMore 
              ? moreSheetOpen 
              : tab.view === currentView || (tab.id === 'home' && currentView === 'DASHBOARD_OVERVIEW');
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.isMore) {
                    setMoreSheetOpen(!moreSheetOpen);
                  } else if (tab.view) {
                    setCurrentView(tab.view);
                    setMoreSheetOpen(false);
                  }
                }}
                className="flex-1 flex flex-col items-center justify-center py-1 group cursor-pointer transition-colors"
              >
                <div className="p-0.5">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? 'text-[#FFC300] stroke-[2.5]'
                        : 'text-[#6B7280] dark:text-slate-400 group-hover:text-black dark:group-hover:text-white stroke-[1.8]'
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] font-semibold transition-colors mt-0.5 ${
                    isActive
                      ? 'text-black dark:text-white font-bold'
                      : 'text-[#6B7280] dark:text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Sheet for More Actions */}
      {moreSheetOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-t-[24px] p-5 shadow-2xl border-t border-slate-200 dark:border-slate-800 max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 max-w-md mx-auto w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-black dark:text-white">
                First Atlantic Services
              </h3>
              <button
                onClick={() => setMoreSheetOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
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
                    className="flex flex-col items-start p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#FFC300]/10 border border-slate-200/60 dark:border-slate-700/60 transition-all text-left cursor-pointer active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FFC300] text-black flex items-center justify-center mb-2 shadow-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-black dark:text-white">{item.label}</span>
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

