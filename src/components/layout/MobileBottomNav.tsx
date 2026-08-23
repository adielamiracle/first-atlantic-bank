import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Receipt,
  MoreHorizontal,
  CreditCard,
  Camera,
  FileText,
  ShieldCheck,
  MessageSquare,
  User,
  X
} from 'lucide-react';
import { useBank, AppView } from '../../context/BankContext';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView } = useBank();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const mainTabs: { label: string; view: AppView; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Home', view: 'DASHBOARD_OVERVIEW', icon: LayoutDashboard },
    { label: 'Accounts', view: 'DASHBOARD_ACCOUNT_DETAIL', icon: Wallet },
    { label: 'Pay & Transfer', view: 'DASHBOARD_TRANSFERS', icon: ArrowLeftRight },
    { label: 'Cards', view: 'DASHBOARD_CARDS', icon: CreditCard },
  ];

  const moreItems: { label: string; view: AppView; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Bill Pay & Remittance', view: 'DASHBOARD_BILLPAY', icon: Receipt },
    { label: 'Mobile Check Deposit', view: 'DASHBOARD_DEPOSIT', icon: Camera },
    { label: 'Statements & Tax', view: 'DASHBOARD_STATEMENTS', icon: FileText },
    { label: 'Security Center', view: 'DASHBOARD_SECURITY', icon: ShieldCheck },
    { label: 'Concierge Messages', view: 'DASHBOARD_MESSAGES', icon: MessageSquare },
    { label: 'Profile & Settings', view: 'DASHBOARD_PROFILE', icon: User }
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#0a192f] border-t border-slate-200 dark:border-[#1e3656] shadow-lg px-2 py-1.5 flex items-center justify-around transition-colors">
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
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-[#8c6d37] dark:text-[#c5a880] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#8c6d37] dark:text-[#c5a880]' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setMoreSheetOpen(!moreSheetOpen)}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            moreSheetOpen
              ? 'text-[#8c6d37] dark:text-[#c5a880] font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 mb-0.5 ${moreSheetOpen ? 'text-[#8c6d37] dark:text-[#c5a880]' : 'text-slate-500 dark:text-slate-400'}`} />
          <span>More</span>
        </button>
      </nav>

      {/* Bottom Sheet for More Actions */}
      {moreSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white dark:bg-[#0c1f36] rounded-t-2xl p-5 shadow-2xl border-t border-slate-200 dark:border-[#1e3656] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 font-serif">
                More Banking Services
              </h3>
              <button
                onClick={() => setMoreSheetOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      setCurrentView(item.view);
                      setMoreSheetOpen(false);
                    }}
                    className="flex flex-col items-start p-3.5 rounded-xl bg-slate-50 dark:bg-[#071322] hover:bg-slate-100 dark:hover:bg-[#0a1b30] border border-slate-200/80 dark:border-[#1e3656] transition-colors text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center mb-2 border border-[#c5a880]/30">
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
