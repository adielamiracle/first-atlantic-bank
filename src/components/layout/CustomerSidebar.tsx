import React from 'react';
import {
  Home,
  Building,
  ArrowUpDown,
  FileText,
  CreditCard,
  PiggyBank,
  LayoutGrid,
  Star,
  Shield,
  Bell,
  User,
  MoreHorizontal,
  LogOut,
  Moon,
  Sun,
  X,
  ShieldAlert
} from 'lucide-react';
import { useBank, AppView } from '../../context/BankContext';

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export const CustomerSidebar: React.FC<SidebarProps> = ({ onClose, isMobile = false }) => {
  const { 
    currentView, 
    setCurrentView, 
    currentUser, 
    currentRole,
    logout, 
    switchToAdmin, 
    darkMode, 
    toggleDarkMode
  } = useBank();

  const handleNavClick = (view?: AppView) => {
    if (view) {
      setCurrentView(view);
    }
    if (onClose) {
      onClose();
    }
  };

  // Top Section Menu Items
  const primaryMenuItems: { label: string; view: AppView; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Home', view: 'DASHBOARD_OVERVIEW', icon: Home },
    { label: 'Accounts', view: 'DASHBOARD_ACCOUNT_DETAIL', icon: Building },
    { label: 'Pay & transfer', view: 'DASHBOARD_TRANSFERS', icon: ArrowUpDown },
    { label: 'Activity', view: 'DASHBOARD_STATEMENTS', icon: FileText },
    { label: 'Cards', view: 'DASHBOARD_CARDS', icon: CreditCard },
    { label: 'Savings', view: 'DASHBOARD_GLASS_STUDIO', icon: PiggyBank },
    { label: 'Budget', view: 'DASHBOARD_BILLPAY', icon: LayoutGrid },
    { label: 'Rewards', view: 'DASHBOARD_CARDS', icon: Star },
  ];

  // Secondary Section Menu Items
  const secondaryMenuItems: { 
    label: string; 
    view?: AppView; 
    icon: React.ComponentType<{ className?: string }>; 
    hasBadge?: boolean;
  }[] = [
    { label: 'Security center', view: 'DASHBOARD_SECURITY', icon: Shield },
    { label: 'Notifications', view: 'DASHBOARD_MESSAGES', icon: Bell, hasBadge: true },
    { label: 'Profile & settings', view: 'DASHBOARD_PROFILE', icon: User },
    { label: 'More', view: 'DASHBOARD_GLASS_STUDIO', icon: MoreHorizontal },
  ];

  const displayName = currentUser 
    ? `${currentUser.firstName} ${currentUser.lastName}` 
    : 'Jonathan Sterling';

  const userInitials = currentUser 
    ? `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase()
    : 'JS';

  return (
    <aside 
      className={`w-[280px] bg-[#000000] text-white flex flex-col justify-between shrink-0 h-screen select-none overflow-y-auto overflow-x-hidden font-sans border-r border-[#1a1a1a] shadow-2xl z-50 ${
        isMobile ? 'h-full max-w-[85vw]' : 'sticky top-0 hidden lg:flex'
      }`}
    >
      <div className="p-4 space-y-4">
        {/* 1. Header: "First Atlantic" with yellow dot and X close button in white */}
        <div className="flex items-center justify-between pt-1 pb-1 px-1">
          <button
            onClick={() => handleNavClick('DASHBOARD_OVERVIEW')}
            className="flex items-center cursor-pointer select-none text-left"
          >
            <span className="text-[20px] font-bold tracking-tight text-white">
              First Atlantic
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FFC300] ml-1 self-end mb-1" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white hover:text-neutral-300 transition-colors cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}
        </div>

        {/* 2. Profile Card: Background #FFC300 with 16px border-radius, Padding 16px */}
        <div className="bg-[#FFC300] rounded-[16px] p-4 text-black flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-white/25 border border-black/10 text-black font-bold text-sm flex items-center justify-center shrink-0">
            {userInitials || 'JS'}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-black truncate leading-tight">
              {displayName}
            </div>
            <div className="text-[12px] font-normal text-black/80 mt-0.5 truncate">
              Verified Tier 3 Account
            </div>
          </div>
        </div>

        {/* 3. Primary Menu List (Inter 600 16px, 48px height, 16px padding) */}
        <div className="space-y-1 pt-1">
          {primaryMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.view)}
                className={`w-full h-[48px] px-4 rounded-[12px] flex items-center gap-3.5 text-[15px] sm:text-[16px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFC300] text-black font-bold shadow-xs'
                    : 'text-white/85 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-black stroke-[2.5]' : 'text-white/85 stroke-[2]'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Divider: 1px line #222222 */}
        <div className="border-t border-[#222222] my-2 mx-1" />

        {/* 5. Secondary Menu List */}
        <div className="space-y-1">
          {secondaryMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.view && currentView === item.view;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.view)}
                className={`w-full h-[48px] px-4 rounded-[12px] flex items-center gap-3.5 text-[15px] sm:text-[16px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFC300] text-black font-bold shadow-xs'
                    : 'text-white/85 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-black stroke-[2.5]' : 'text-white/85 stroke-[2]'}`} />
                <span className="truncate">{item.label}</span>
                {item.hasBadge && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#EF4444]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Footer: Dark Theme Toggle & Sign Out in Red #EF4444 */}
      <div className="p-4 border-t border-[#222222] space-y-2">
        {/* Dark Theme toggle with Moon icon and LIGHT gray pill */}
        <button
          onClick={toggleDarkMode}
          className="w-full h-[44px] px-3.5 rounded-[12px] flex items-center justify-between text-[14px] font-semibold text-white/85 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-3">
            {darkMode ? <Sun className="w-4.5 h-4.5 text-[#FFC300]" /> : <Moon className="w-4.5 h-4.5 text-white/80" />}
            <span>Dark Theme</span>
          </span>
          <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#222222] text-[#9CA3AF] border border-white/5">
            {darkMode ? 'DARK' : 'LIGHT'}
          </span>
        </button>

        {/* Admin Console Switcher if admin role */}
        {(currentRole === 'ADMIN' || currentUser?.role === 'ADMIN') && (
          <button
            onClick={() => {
              if (onClose) onClose();
              switchToAdmin();
            }}
            className="w-full h-[44px] px-3.5 rounded-[12px] flex items-center justify-between text-[14px] font-semibold text-[#FFC300] bg-[#FFC300]/10 hover:bg-[#FFC300]/20 border border-[#FFC300]/20 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <ShieldAlert className="w-4.5 h-4.5 text-[#FFC300]" />
              <span>Admin Console</span>
            </span>
            <span className="text-xs">→</span>
          </button>
        )}

        {/* Sign Out in red #EF4444 with logout icon */}
        <button
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="w-full h-[44px] px-3.5 rounded-[12px] flex items-center gap-3 text-[14px] font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5 text-[#EF4444]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
