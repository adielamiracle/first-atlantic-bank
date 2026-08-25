import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useBank } from '../../context/BankContext';
import {
  MessageSquare,
  Sparkles,
  Bell,
  BellRing,
  X,
  Send,
  Check,
  Bot,
  User,
  Shield,
  Clock,
  ChevronUp,
  ChevronDown,
  Headphones,
  ExternalLink,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Declare global Smartsupp window types
declare global {
  interface Window {
    _smartsupp?: any;
    smartsupp?: any;
  }
}

export const SmartsuppWidget: React.FC = () => {
  const { currentUser, isAuthenticated, currentView, showToast } = useBank();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: 'AI_AGENT' | 'OFFICER' | 'USER' | 'SYSTEM';
    text: string;
    timestamp: string;
    isProactive?: boolean;
  }>>([
    {
      id: 'init_welcome',
      sender: 'AI_AGENT',
      text: `Welcome to First Atlantic Bank Private Wealth Concierge. I am FIRST ATLANTIC BANK ASSISTANT AI. How may our advisory desk assist your banking and portfolio operations today?`,
      timestamp: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [hasTriggeredProactive30s, setHasTriggeredProactive30s] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushNotificationGranted, setPushNotificationGranted] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });
  const [showPushBanner, setShowPushBanner] = useState(false);
  const [showAiToolsModal, setShowAiToolsModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const lastActivityTimeRef = useRef<number>(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Smartsupp Official SDK script loader
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window._smartsupp = window._smartsupp || {};
    // Configure default Smartsupp options
    window._smartsupp.key = window._smartsupp.key || 'fab_smartsupp_prod_live';
    window._smartsupp.orientation = 'right';
    window._smartsupp.offsetY = 85;
    window._smartsupp.offsetX = 20;

    if (!window.smartsupp) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.charset = 'utf-8';
      script.async = true;
      script.src = 'https://www.smartsuppchat.com/loader.js?';
      
      script.onload = () => {
        if (window.smartsupp) {
          window.smartsupp('theme:color', '#0a192f');
        }
      };
      
      script.onerror = () => {
        // Fallback gracefully to built-in smartsupp component
        console.info('Smartsupp script initialized in client mode.');
      };

      document.body.appendChild(script);
    }
  }, []);

  // 2. Synchronize user profile & variables to Smartsupp
  useEffect(() => {
    if (typeof window !== 'undefined' && window.smartsupp && currentUser) {
      try {
        window.smartsupp('name', `${currentUser.firstName} ${currentUser.lastName}`);
        window.smartsupp('email', currentUser.email);
        window.smartsupp('variables', {
          cif: currentUser.id,
          tier: currentUser.kycTier || 'Private Wealth',
          region: currentUser.region || 'US',
          username: currentUser.username,
          passportVerified: !!currentUser.hasPassportImage
        });
      } catch (e) {
        console.debug('Smartsupp variable sync:', e);
      }
    }
  }, [currentUser]);

  // 3. Proactive Welcome Message for Users Idle for > 30 seconds on Dashboard
  useEffect(() => {
    const updateActivity = () => {
      lastActivityTimeRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('touchstart', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });

    const idleCheckerInterval = setInterval(() => {
      // Only trigger if in dashboard, authenticated, and not triggered yet
      const isDashboard = isAuthenticated && (currentView.startsWith('DASHBOARD_') || currentView === 'PUBLIC_HOME');
      if (!isDashboard || hasTriggeredProactive30s) return;

      const idleDurationMs = Date.now() - lastActivityTimeRef.current;

      if (idleDurationMs >= 30000) { // 30 seconds idle threshold
        setHasTriggeredProactive30s(true);
        const name = currentUser?.firstName || 'Valued Client';

        const proactiveMsg = {
          id: `proactive_${Date.now()}`,
          sender: 'OFFICER' as const,
          text: `Good day ${name}. I noticed you've been reviewing your portfolio dashboard. Would you like assistance with international wire routing, 5.15% APY yield compounding, or booking an executive advisory appointment?`,
          timestamp: 'Just now',
          isProactive: true
        };

        setMessages(prev => [...prev, proactiveMsg]);
        setUnreadCount(prev => prev + 1);
        setIsOpen(true);
        setIsMinimized(false);

        // Native push / Smartsupp trigger
        if (typeof window !== 'undefined' && window.smartsupp) {
          try {
            window.smartsupp('chat:open');
            window.smartsupp('chat:message', proactiveMsg.text);
          } catch (e) {}
        }

        // Fire browser push notification if permitted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('First Atlantic Bank • Private Concierge', {
              body: proactiveMsg.text,
              icon: '/favicon.ico'
            });
          } catch (e) {}
        } else {
          setShowPushBanner(true);
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('click', updateActivity);
      clearInterval(idleCheckerInterval);
    };
  }, [isAuthenticated, currentView, hasTriggeredProactive30s, currentUser]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Handle requesting Web Push Notifications
  const requestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('INFO', 'Push Notifications', 'Push notifications are not supported by this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushNotificationGranted(true);
        setShowPushBanner(false);
        showToast('SUCCESS', 'Push Notifications Enabled', 'You will be notified instantly when a private banker responds.');
        
        try {
          new Notification('First Atlantic Bank • Live Client Connect', {
            body: 'Push alerts configured. You will stay updated even if you navigate away.',
            icon: '/favicon.ico'
          });
        } catch (e) {}
      } else {
        showToast('INFO', 'Notification Permission', 'Push alerts were declined or silenced.');
        setShowPushBanner(false);
      }
    } catch (e) {
      console.error(e);
      setShowPushBanner(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'USER' as const,
      text: userText,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Call external Smartsupp if loaded
    if (typeof window !== 'undefined' && window.smartsupp) {
      try {
        window.smartsupp('chat:message', userText);
      } catch (e) {}
    }

    // AI Concierge response generator
    setTimeout(() => {
      setIsTyping(false);
      let replyText = `Thank you for your message. Your inquiry has been processed by FIRST ATLANTIC BANK ASSISTANT AI and routed to your Senior Private Wealth Banker. A dedicated representative will attend to your request immediately.`;

      const lower = userText.toLowerCase();
      if (lower.includes('wire') || lower.includes('transfer')) {
        replyText = `For wire transfers, First Atlantic supports Fedwire (US), CHAPS (UK), and SEPA Instant (EU). Domestic wires clear within 15 minutes; international SWIFT clearing takes 2-4 hours. You can initiate a transfer directly via the Transfers tab.`;
      } else if (lower.includes('interest') || lower.includes('apy') || lower.includes('yield')) {
        replyText = `Our Apex High-Yield Vault pays 5.15% APY with daily compounding and no lock-in penalty. Yield is credited to your checking or savings account on the final business day of every month.`;
      } else if (lower.includes('card') || lower.includes('freeze') || lower.includes('limit')) {
        replyText = `Your Atlantic Infinite Titanium card features zero foreign transaction fees, global lounge access, and customizable velocity limits. You can toggle freeze protection in one click under Cards.`;
      } else if (lower.includes('push') || lower.includes('notify')) {
        replyText = `Push notifications are active. When an advisory officer replies, you'll receive a real-time browser banner so you don't need to keep the window open.`;
      }

      const agentMsg = {
        id: `agent_${Date.now()}`,
        sender: 'AI_AGENT' as const,
        text: replyText,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, agentMsg]);

      // Push notification trigger if window isn't focused
      if (pushNotificationGranted && document.hidden) {
        try {
          new Notification('First Atlantic Bank • Assistant AI', {
            body: replyText,
            icon: '/favicon.ico'
          });
        } catch (e) {}
      }
    }, 1100);
  };

  return (
    <>
      {/* Floating Action Button (One-Click Contact) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 font-sans">
        {/* Proactive Push Notification Prompt Banner */}
        <AnimatePresence>
          {showPushBanner && !pushNotificationGranted && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-[#0a192f] text-white p-4 rounded-2xl shadow-2xl border border-[#c5a880]/50 max-w-sm text-xs space-y-2.5 mb-2 backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-[#e5ca95] font-bold font-serif">
                  <BellRing className="w-4 h-4 text-[#d4af37] animate-pulse" />
                  <span>Stay in the loop with Push Notifications</span>
                </div>
                <button
                  onClick={() => setShowPushBanner(false)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Keep your account in the loop with instant alerts when an officer or AI assistant responds. You don’t need to keep the app open to stay updated.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={requestPushPermission}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 font-bold text-[11px] uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer shadow-sm"
                >
                  Enable Push Alerts
                </button>
                <button
                  onClick={() => setShowPushBanner(false)}
                  className="px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-white"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setUnreadCount(0);
            if (typeof window !== 'undefined' && window.smartsupp) {
              try {
                if (!isOpen) window.smartsupp('chat:open');
                else window.smartsupp('chat:close');
              } catch (e) {}
            }
          }}
          className="relative px-4 py-3 rounded-full bg-gradient-to-r from-[#0a192f] via-[#122846] to-[#0a192f] text-white shadow-2xl border border-[#c5a880]/60 flex items-center gap-2.5 hover:border-[#c5a880] transition-all cursor-pointer group"
          title="FIRST ATLANTIC BANK ASSISTANT AI"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-[#d4af37] group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a192f] animate-pulse" />
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold font-serif text-[#e5ca95] leading-none">
              FIRST ATLANTIC BANK
            </div>
            <div className="text-[10px] text-slate-300 font-sans mt-0.5 tracking-wide font-medium">
              ASSISTANT AI • ONLINE
            </div>
          </div>

          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center font-mono ring-2 ring-[#0a192f]">
              {unreadCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Integrated Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[82vh] bg-white dark:bg-[#0a192f] rounded-2xl shadow-2xl border border-slate-300 dark:border-[#1e3656] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 font-sans"
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#0a192f] to-[#142c4c] text-white flex items-center justify-between border-b border-[#c5a880]/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-[#112a4a] border border-[#c5a880]/40 flex items-center justify-center text-[#d4af37] font-serif font-bold text-sm">
                    FA
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a192f]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-bold font-serif text-[#e5ca95] tracking-wide">
                      FIRST ATLANTIC BANK ASSISTANT AI
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>24/7 Private Wealth Banking Concierge</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowAiToolsModal(true)}
                  title="Run with Banking AI Tools"
                  className="p-1.5 rounded-lg text-[#c5a880] hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-Header AI Tools Connectivity Banner */}
            <div className="bg-slate-100 dark:bg-slate-900/80 px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] shrink-0">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                <Zap className="w-3.5 h-3.5 text-[#8c6d37] dark:text-[#c5a880]" />
                <span>AI Advisory Engine Active</span>
              </div>
              <button
                onClick={requestPushPermission}
                className="text-[10px] text-[#8c6d37] dark:text-[#c5a880] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Bell className="w-3 h-3" />
                <span>{pushNotificationGranted ? 'Push Active' : 'Enable Push Alerts'}</span>
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-[#f8fafc] dark:bg-[#07101e]">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'USER' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300 mb-0.5 font-mono">
                    {msg.sender === 'USER' ? (
                      <span>You</span>
                    ) : msg.sender === 'OFFICER' ? (
                      <span className="text-[#8c6d37] dark:text-[#e5ca95] font-bold flex items-center gap-1">
                        <User className="w-2.5 h-2.5" /> Private Banker
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Bot className="w-2.5 h-2.5" /> FIRST ATLANTIC BANK ASSISTANT AI
                      </span>
                    )}
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.sender === 'USER'
                        ? 'bg-[#0a192f] text-white rounded-tr-none shadow-sm border border-[#c5a880]/30'
                        : msg.isProactive
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 rounded-tl-none shadow-xs'
                        : 'bg-white dark:bg-[#112a4a] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-2 bg-slate-200/60 dark:bg-slate-800 rounded-xl max-w-[80px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Pill Suggestions */}
            <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {[
                'Wire Clearing Rail Info',
                'UK / US Bank Routing',
                '5.15% APY Vault Yield',
                'Speak with Advisory Officer'
              ].map(pill => (
                <button
                  key={pill}
                  onClick={() => {
                    setInputMessage(pill);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-nowrap cursor-pointer transition-colors shrink-0"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white dark:bg-[#0a192f] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Ask FIRST ATLANTIC BANK ASSISTANT AI..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#8c6d37]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#132d52] text-white disabled:opacity-50 transition-all cursor-pointer border border-[#c5a880]/30 shrink-0"
              >
                <Send className="w-4 h-4 text-[#d4af37]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Tools & Statistics Integration Modal */}
      <AnimatePresence>
        {showAiToolsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0a192f] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-300 dark:border-[#1e3656] space-y-5 text-slate-900 dark:text-slate-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/40">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                      FIRST ATLANTIC BANK ASSISTANT AI
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Unified Banking Intelligence &amp; Real-time Concierge
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiToolsModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Intelligent wire routing, dual-currency insights, and instant advisory support.
                </p>
                <p>
                  Experience institutional-grade banking assistance with automated push alerts, real-time clearing tracking, and private wealth wealth management.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Instant Push Alerts</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Receive immediate updates when an officer or transaction completes.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
                  <div className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>One-Click Routing</span>
                  </div>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400">
                    Fast automated transfer assistance and currency conversion advisory.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    requestPushPermission();
                    setShowAiToolsModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#c5a880]/30"
                >
                  Enable Live Push Alerts
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
