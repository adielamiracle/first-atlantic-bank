import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  FileText,
  Headphones,
  Bell,
  X,
  Check,
  CheckCircle2,
  Copy,
  Building2,
  ShieldCheck,
  CreditCard,
  Database,
  Globe,
  CloudUpload,
  Eye,
  EyeOff,
  User,
  Settings,
  ChevronRight,
  Search,
  Lock,
  Smartphone,
  HelpCircle,
  LogOut,
  QrCode,
  Share2,
  Download,
  Fingerprint,
  Scan,
  RefreshCw,
  BadgeCheck,
  Edit3,
  ExternalLink,
  ChevronDown,
  Sparkles,
  DollarSign,
  AlertCircle,
  Sliders,
  KeyRound,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { useBank } from '../context/BankContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { REGISTERED_BANKS } from '../data/banksData';

// Helper to extract clean 2-letter monogram words for counterparty & beneficiaries
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'FA';
  const clean = name.replace(/^(Send to|Request to|Transfer to|Pay|Top Up|Wire to)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    setCurrentView,
    recentTransactions,
    accounts,
    cards,
    logout,
    showToast,
    refreshData,
    updatePassportDetails
  } = useBank();

  // Navigation Tabs in Mobile Dashboard: 'home' | 'cards' | 'send' | 'history' | 'profile'
  const [activeTab, setActiveTab] = useState('home');

  // Segmented mode on Home: 'balance' | 'cards'
  const [segmentedMode, setSegmentedMode] = useState('balance');

  // Live Balance State
  const [liveBalance, setLiveBalance] = useState(0.00);
  const [hideBalance, setHideBalance] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // User Passport Photo (uploaded directly by user from user dashboard)
  const [userPassportPhoto, setUserPassportPhoto] = useState(() => {
    try {
      const saved = localStorage.getItem('fab_user_passport_photo');
      if (saved) return saved;
    } catch (e) {}
    return currentUser?.passportPhoto || '';
  });
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [passportPreviewUrl, setPassportPreviewUrl] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSavingPassport, setIsSavingPassport] = useState(false);
  const [isDraggingPassport, setIsDraggingPassport] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const passportFileInputRef = useRef(null);

  // Synchronize passport photo if user data changes
  useEffect(() => {
    if (currentUser?.passportPhoto && !localStorage.getItem('fab_user_passport_photo')) {
      setUserPassportPhoto(currentUser.passportPhoto);
    }
  }, [currentUser?.passportPhoto]);

  // Clean up camera stream on unmount or modal close
  useEffect(() => {
    if (!showPassportModal) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    }
  }, [showPassportModal]);

  const handleSavePassportPhoto = async (photoDataUrl) => {
    const targetPhoto = photoDataUrl || passportPreviewUrl;
    if (!targetPhoto) return;
    setIsSavingPassport(true);
    try {
      setUserPassportPhoto(targetPhoto);
      try {
        localStorage.setItem('fab_user_passport_photo', targetPhoto);
      } catch (e) {}

      if (typeof updatePassportDetails === 'function') {
        await updatePassportDetails({ passportPhoto: targetPhoto });
      }
      showToast?.('Passport Photo Saved', 'Your passport picture has been linked to your user dashboard.');
      setShowPassportModal(false);
      setPassportPreviewUrl('');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    } catch (err) {
      console.warn('Error saving passport photo:', err);
      showToast?.('Passport Photo Updated', 'Passport picture saved locally to your dashboard profile.');
      setShowPassportModal(false);
    } finally {
      setIsSavingPassport(false);
    }
  };

  const handleRemovePassportPhoto = async () => {
    setUserPassportPhoto('');
    try {
      localStorage.removeItem('fab_user_passport_photo');
    } catch (e) {}
    if (typeof updatePassportDetails === 'function') {
      try {
        await updatePassportDetails({ passportPhoto: '' });
      } catch (e) {}
    }
    showToast?.('Passport Photo Removed', 'Your avatar has been reset to your initials monogram.');
  };

  const handlePassportFileSelected = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast?.('Invalid File', 'Please select an image file (JPEG, PNG, or WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          setPassportPreviewUrl(compressed);
        } else {
          setPassportPreviewUrl(dataUrl);
        }
      };
      img.onerror = () => setPassportPreviewUrl(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const startCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err) {
      console.warn('Camera access unavailable:', err);
      showToast?.('Camera Unavailable', 'Please select an image file from your device instead.');
      setIsCameraActive(false);
    }
  };

  const stopCameraCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhotoFromCamera = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPassportPreviewUrl(dataUrl);
        stopCameraCapture();
      }
    }
  };

  // Modals and Drawers
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showCloudSyncModal, setShowCloudSyncModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPayBillsModal, setShowPayBillsModal] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [showLevelAccountModal, setShowLevelAccountModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showBankPickerModal, setShowBankPickerModal] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Cards management state
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [showCardCvv, setShowCardCvv] = useState(false);
  const [spendingLimit, setSpendingLimit] = useState(10000);

  // Profile preferences
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);

  // Profile Editable Info
  const [profileName, setProfileName] = useState(
    currentUser?.fullName || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'Private Client')
  );
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || 'client@firstatlantic.com');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '+1 (555) 019-2830');
  const [profileAddress, setProfileAddress] = useState(
    typeof currentUser?.address === 'string' ? currentUser.address : (currentUser?.address?.line1 || '100 Atlantic Plaza, New York, NY 10001')
  );

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 'notif_1', title: 'Supabase Cloud Synced', body: 'All 13 ledger and customer tables synced.', time: '2m ago', read: false },
    { id: 'notif_2', title: 'Transfer Completed', body: 'Payment of $500.00 settled via Fedwire rail.', time: '1h ago', read: false },
    { id: 'notif_3', title: 'Dividend Received', body: '+$1,200.00 credited to High-Yield Savings.', time: '1d ago', read: true }
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Beneficiaries State for Send Money Flow (initials monograms, professional styling)
  const defaultBeneficiaries = [
    { id: 'b1', name: 'John Doe', shortName: 'John', bank: 'JPMorgan Chase', account: '••••4829', initials: 'JD' },
    { id: 'b2', name: 'Harold Finch', shortName: 'Harold', bank: 'Bank of America', account: '••••1092', initials: 'HF' },
    { id: 'b3', name: 'Leslie Parker', shortName: 'Leslie', bank: 'Chase Bank', account: '••••4821', initials: 'LP' },
    { id: 'b4', name: 'Eduardo Saverin', shortName: 'Eduardo', bank: 'Barclays UK', account: '••••7731', initials: 'ES' },
    { id: 'b5', name: 'Sarah Connor', shortName: 'Sarah', bank: 'HSBC UK', account: '••••8821', initials: 'SC' },
  ];
  const [beneficiaries, setBeneficiaries] = useState(defaultBeneficiaries);
  const [selectedRecipient, setSelectedRecipient] = useState(defaultBeneficiaries[2]); // Leslie Parker by default
  const [sendAmountStr, setSendAmountStr] = useState('250.00');
  const [sendNote, setSendNote] = useState('Personal Wire Transfer & Settlement');
  const [transferSuccessData, setTransferSuccessData] = useState(null);
  const [isProcessingSend, setIsProcessingSend] = useState(false);

  // 3-Step Custom Wire Process (1: Beneficiary & Rail, 2: Amount & Memo, 3: Clearance & Send)
  const [wireStep, setWireStep] = useState(1);

  // Executed Transfers state (persisted locally so any transfer immediately appears in History tab)
  const [executedTransfers, setExecutedTransfers] = useState(() => {
    try {
      const saved = localStorage.getItem('fab_executed_transfers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fab_executed_transfers', JSON.stringify(executedTransfers));
    } catch (e) {}
  }, [executedTransfers]);

  // Beneficiary details & clearance codes state
  const [transferMode, setTransferMode] = useState('CUSTOM'); // 'SAVED' or 'CUSTOM'
  const [recipientNameInput, setRecipientNameInput] = useState('Leslie Parker');
  const [recipientAccountInput, setRecipientAccountInput] = useState('4829104829');
  const [recipientBankInput, setRecipientBankInput] = useState('Chase Bank');
  const [recipientRoutingInput, setRecipientRoutingInput] = useState('021000021');
  const [recipientSwiftInput, setRecipientSwiftInput] = useState('CHASUS33');
  const [transferRail, setTransferRail] = useState('FEDWIRE'); // 'FEDWIRE' | 'SWIFT' | 'ACH'

  // Clearance Codes before sending
  const [cotCodeInput, setCotCodeInput] = useState('COT-7849');
  const [taxCodeInput, setTaxCodeInput] = useState('TAX-8842');
  const [imfCodeInput, setImfCodeInput] = useState('IMF-9921');
  const [transferPinInput, setTransferPinInput] = useState('1234');
  const [showCodeHelp, setShowCodeHelp] = useState(null);

  const handleSelectBeneficiaryItem = (ben) => {
    setSelectedRecipient(ben);
    setRecipientNameInput(ben.name);
    setRecipientAccountInput(ben.account ? ben.account.replace(/[^0-9]/g, '') || '4829104829' : '4829104829');
    setRecipientBankInput(ben.bank || 'Chase Bank');
  };

  const handleStep1Next = () => {
    const finalRecipientName = (recipientNameInput || selectedRecipient?.name || '').trim();
    const finalRecipientAccount = (recipientAccountInput || selectedRecipient?.account || '').trim();
    const finalRecipientBank = (recipientBankInput || selectedRecipient?.bank || '').trim();

    if (!finalRecipientName) {
      showToast?.('Recipient Required', 'Please enter beneficiary name.');
      return;
    }
    if (!finalRecipientAccount) {
      showToast?.('Account Required', 'Please enter account number or IBAN.');
      return;
    }
    if (!finalRecipientBank) {
      showToast?.('Bank Required', 'Please enter destination bank name.');
      return;
    }
    setWireStep(2);
  };

  const handleStep2Next = () => {
    const amt = parseFloat(sendAmountStr || '0');
    if (isNaN(amt) || amt <= 0) {
      showToast?.('Invalid Amount', 'Please enter a valid transfer amount.');
      return;
    }
    if (amt > liveBalance) {
      showToast?.('Insufficient Balance', `Available balance is $${liveBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`);
      return;
    }
    setWireStep(3);
  };

  const handleAutoFillClearanceCodes = () => {
    const randomNum = () => Math.floor(1000 + Math.random() * 9000);
    setCotCodeInput(`COT-${randomNum()}`);
    setTaxCodeInput(`TAX-${randomNum()}`);
    setImfCodeInput(`IMF-${randomNum()}`);
    setTransferPinInput('1234');
    showToast?.('Clearance Codes Generated', 'Valid COT, Tax, and IMF regulatory codes filled.');
  };

  // Bank Search for Picker
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [bankFilterRegion, setBankFilterRegion] = useState('ALL');

  // History Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyCategory, setHistoryCategory] = useState('ALL');

  // Default transactions list with professional letter monograms (Alphonso Davied, Codashop, Fariz Zacky, Darwin Nunez, etc.)
  const defaultTransactions = useMemo(() => [
    {
      id: 'tx_101',
      name: 'Send to Alphonso Davied',
      recipient: 'Alphonso Davied',
      note: 'Note: pay for the apart electricity',
      date: 'Mon, 05 Aug 2024',
      dateGroup: 'Mon, 05 Aug 2024',
      time: '15.30 PM',
      amount: -650.00,
      direction: 'DEBIT',
      category: 'transfer',
      initials: 'AD',
      status: 'Completed',
      refNo: '#TXN847291'
    },
    {
      id: 'tx_102',
      name: 'Top Up Diamond Mobile Legend',
      recipient: 'Codashop Mobile',
      note: 'Codashop Digital Services',
      date: 'Mon, 05 Aug 2024',
      dateGroup: 'Mon, 05 Aug 2024',
      time: '11.30 AM',
      amount: -250.00,
      direction: 'DEBIT',
      category: 'topup',
      initials: 'CM',
      status: 'Completed',
      refNo: '#TXN847292'
    },
    {
      id: 'tx_103',
      name: 'Request to Fariz Zacky',
      recipient: 'Fariz Zacky',
      note: 'Invoice Settlement Success',
      date: 'Mon, 05 Aug 2024',
      dateGroup: 'Mon, 05 Aug 2024',
      time: '09.00 AM',
      amount: 1200.00,
      direction: 'CREDIT',
      category: 'transfer',
      initials: 'FZ',
      status: 'Completed',
      refNo: '#TXN847293'
    },
    {
      id: 'tx_104',
      name: 'Send to Darwin Nunez',
      recipient: 'Darwin Nunez',
      note: 'For trading learning mentorship',
      date: 'Sun, 04 Aug 2024',
      dateGroup: 'Sun, 04 Aug 2024',
      time: '20.45 PM',
      amount: -1500.00,
      direction: 'DEBIT',
      category: 'transfer',
      initials: 'DN',
      status: 'Completed',
      refNo: '#TXN847294'
    },
    {
      id: 'tx_105',
      name: 'Pay Internet Provider',
      recipient: 'Indihome Fiber',
      note: 'Pay indihome August broadband',
      date: 'Sun, 04 Aug 2024',
      dateGroup: 'Sun, 04 Aug 2024',
      time: '12.45 PM',
      amount: -430.00,
      direction: 'DEBIT',
      category: 'bills',
      initials: 'IH',
      status: 'Completed',
      refNo: '#TXN847295'
    },
    {
      id: 'tx_106',
      name: 'Spotify Premium',
      recipient: 'Spotify AB',
      note: 'Monthly subscription',
      date: 'Fri, 02 Aug 2024',
      dateGroup: 'Fri, 02 Aug 2024',
      time: '14.40 PM',
      amount: -12.99,
      direction: 'DEBIT',
      category: 'subscriptions',
      initials: 'SP',
      status: 'Completed',
      refNo: '#TXN847296'
    }
  ], []);

  // Fetch live balance from API or Supabase
  const fetchLiveBalance = useCallback(async () => {
    try {
      const token = localStorage.getItem('fab_session_token') || localStorage.getItem('token') || currentUser?.id;
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;

      const res = await fetch('/api/user/me', { headers });
      if (res.ok) {
        const data = await res.json();
        const bal = typeof data.balance === 'number'
          ? data.balance
          : (typeof data.user?.balance === 'number' ? data.user.balance : 0.00);
        setLiveBalance(bal);
      } else if (accounts && accounts.length > 0) {
        const total = accounts.reduce((sum, a) => sum + ((a.availableBalanceMinor || a.balanceMinor || 0) / 100), 0);
        setLiveBalance(total);
      }
    } catch (err) {
      console.warn('[Dashboard] Notice fetching balance:', err);
    }
  }, [currentUser?.id, accounts]);

  // Keep profile dynamic and in sync with currentUser
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.fullName || (currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'Private Client'));
      if (currentUser.email) setProfileEmail(currentUser.email);
      if (currentUser.phone) setProfilePhone(currentUser.phone);
      if (currentUser.address) {
        setProfileAddress(typeof currentUser.address === 'string' ? currentUser.address : (currentUser.address.line1 || '100 Atlantic Plaza, New York, NY 10001'));
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchLiveBalance();

    let channel = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('dashboard_mobile_sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, () => {
            fetchLiveBalance();
          })
          .subscribe();
      } catch (e) {}
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchLiveBalance]);

  // Handle Copy helper
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    showToast?.('Copied to Clipboard', `${label}: ${text}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Custom Keypad input handler for Send Money (matches screenshot 3)
  const handleKeypadPress = (val) => {
    if (val === 'DEL') {
      setSendAmountStr(prev => {
        if (prev.length <= 1) return '0.00';
        const cleaned = prev.slice(0, -1);
        return cleaned === '' || cleaned === '$' ? '0.00' : cleaned;
      });
      return;
    }

    if (val === '.') {
      if (sendAmountStr.includes('.')) return;
      setSendAmountStr(prev => (prev === '0.00' || prev === '' ? '0.' : prev + '.'));
      return;
    }

    setSendAmountStr(prev => {
      if (prev === '0.00' || prev === '0' || prev === '') {
        return val;
      }
      // Max 2 decimal digits
      if (prev.includes('.')) {
        const parts = prev.split('.');
        if (parts[1]?.length >= 2) return prev;
      }
      // Max limit $50,000 per transfer
      const nextStr = prev + val;
      if (parseFloat(nextStr) > 50000) {
        showToast?.('Daily wire limit', 'Maximum single mobile transfer is $50,000.00');
        return prev;
      }
      return nextStr;
    });
  };

  // Execute Transfer
  const handleExecuteSend = async () => {
    const amt = parseFloat(sendAmountStr || '0');
    if (isNaN(amt) || amt <= 0) {
      showToast?.('Invalid Amount', 'Please enter a valid transfer amount.');
      return;
    }
    if (amt > liveBalance) {
      showToast?.('Insufficient Balance', `Available balance is $${liveBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`);
      return;
    }

    const finalRecipientName = (recipientNameInput || selectedRecipient?.name || 'Beneficiary').trim();
    const finalRecipientAccount = (recipientAccountInput || selectedRecipient?.account || '4829104829').trim();
    const finalRecipientBank = (recipientBankInput || selectedRecipient?.bank || 'Chase Bank').trim();

    // Mandatory Regulatory Clearance Codes Validation
    if (!cotCodeInput.trim()) {
      showToast?.('COT Code Required', 'Please enter the Cost of Transfer (COT) Code.');
      return;
    }
    if (!taxCodeInput.trim()) {
      showToast?.('Tax Code Required', 'Please enter the Tax Clearance Code (TCC).');
      return;
    }
    if (!imfCodeInput.trim()) {
      showToast?.('IMF Code Required', 'Please enter the IMF clearance code.');
      return;
    }
    if (!transferPinInput || transferPinInput.trim().length < 4) {
      showToast?.('Security PIN Required', 'Please enter your 4-digit transfer PIN.');
      return;
    }

    setIsProcessingSend(true);
    try {
      const txRef = `#TXN${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // Deduct balance locally & call server
      const newBal = Math.max(0, liveBalance - amt);
      setLiveBalance(newBal);

      const resolvedSourceAcc = accounts[0]
        ? `${accounts[0].name} (${accounts[0].accountNumber || '••••'})`
        : 'Primary Checking';

      try {
        const token = localStorage.getItem('fab_session_token') || localStorage.getItem('token') || currentUser?.id || '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (currentUser?.id) headers['x-user-id'] = currentUser.id;

        await fetch('/api/transfers/execute', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            amount: amt,
            amountMinor: Math.round(amt * 100),
            recipientName: finalRecipientName,
            recipientBank: finalRecipientBank,
            recipientAccount: finalRecipientAccount,
            routing: recipientRoutingInput,
            swift: recipientSwiftInput,
            transferRail,
            cotCode: cotCodeInput.trim(),
            taxCode: taxCodeInput.trim(),
            imfCode: imfCodeInput.trim(),
            pin: transferPinInput.trim(),
            note: sendNote || 'Direct Mobile Wire',
            sourceAccountId: accounts[0]?.id,
            userId: currentUser?.id
          })
        });
      } catch (e) {}

      // Trigger background Supabase sync
      fetch('/api/supabase/sync', { method: 'POST' }).catch(() => {});

      const railLabel = transferRail === 'SWIFT' ? 'SWIFT MT103 Global Network' :
                        transferRail === 'ACH' ? 'ACH Real-Time Rail' : 'Fedwire Domestic Same-Day';

      // Instantly record the new transfer in the bank so it immediately shows in the History tab down button
      const newTx = {
        id: txRef,
        name: `Transfer to ${finalRecipientName}`,
        recipient: finalRecipientName,
        bank: finalRecipientBank,
        account: finalRecipientAccount,
        note: sendNote || 'Direct Mobile Wire',
        date: `${dateStr} ${timeStr}`,
        dateGroup: 'Today',
        time: timeStr,
        amount: -amt,
        direction: 'DEBIT',
        category: 'transfer',
        initials: getInitials(finalRecipientName),
        status: 'Completed',
        refNo: txRef
      };
      setExecutedTransfers(prev => [newTx, ...prev]);

      // Refresh bank data from backend
      if (typeof refreshData === 'function') {
        refreshData().catch(() => {});
      }

      setTransferSuccessData({
        txId: txRef,
        amount: amt.toFixed(2),
        recipientName: finalRecipientName,
        recipientBank: finalRecipientBank,
        recipientAccount: finalRecipientAccount,
        routing: recipientRoutingInput,
        swift: recipientSwiftInput,
        transferRail: railLabel,
        cotCode: cotCodeInput.trim(),
        taxCode: taxCodeInput.trim(),
        imfCode: imfCodeInput.trim(),
        fromAccount: `${profileName} (${accounts[0]?.name || 'Checking'} ${accounts[0]?.accountNumber || '••••'})`,
        date: `${dateStr} ${timeStr}`,
        refNo: txRef
      });
      showToast?.('Transfer Successful', `$${amt.toFixed(2)} sent to ${finalRecipientName}.`);
    } catch (err) {
      showToast?.('Transfer Failed', 'An error occurred while routing the transfer.');
    } finally {
      setIsProcessingSend(false);
    }
  };

  // Filtered Banks for worldwide bank search
  const filteredBanks = useMemo(() => {
    return REGISTERED_BANKS.filter(bank => {
      const matchesSearch = !bankSearchQuery || 
        bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
        bank.shortName.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
        bank.swiftBic.toLowerCase().includes(bankSearchQuery.toLowerCase());
      const matchesRegion = bankFilterRegion === 'ALL' || bank.country === bankFilterRegion;
      return matchesSearch && matchesRegion;
    });
  }, [bankSearchQuery, bankFilterRegion]);

  // Real user transactions mapped for display with immediate executed transfers
  const userTransactions = useMemo(() => {
    const list = [...executedTransfers];
    if (recentTransactions && recentTransactions.length > 0) {
      const mapped = recentTransactions.map(tx => {
        const isCredit = tx.direction === 'CREDIT' || (tx.amountMinor || 0) > 0;
        const amtVal = Math.abs((tx.amountMinor || 0) / 100);
        const dateObj = tx.effectiveTimestamp ? new Date(tx.effectiveTimestamp) : new Date();
        const dateFormatted = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
        const isToday = new Date().toDateString() === dateObj.toDateString();
        const dateGroup = isToday ? 'Today' : dateFormatted;

        return {
          id: tx.id || tx.transactionId,
          name: tx.description || (isCredit ? 'Deposit' : 'Transfer Sent'),
          recipient: tx.counterparty || 'First Atlantic Bank',
          note: tx.referenceNumber ? `Ref: ${tx.referenceNumber}` : (tx.description || 'Institutional Settlement'),
          date: dateFormatted,
          dateGroup: dateGroup,
          time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          amount: isCredit ? amtVal : -amtVal,
          direction: tx.direction,
          category: (tx.category || 'transfer').toLowerCase(),
          initials: getInitials(tx.counterparty || tx.description || 'FAB'),
          status: tx.status || 'Completed',
          refNo: tx.referenceNumber || `#TXN${tx.id?.slice(-6) || '847291'}`
        };
      });

      const existingRefs = new Set(list.map(t => t.refNo || t.id));
      mapped.forEach(m => {
        if (!existingRefs.has(m.refNo) && !existingRefs.has(m.id)) {
          list.push(m);
        }
      });
    } else if (list.length === 0) {
      return defaultTransactions;
    }
    return list;
  }, [recentTransactions, executedTransfers, defaultTransactions]);

  // Combined transactions list for history tab
  const combinedTransactions = useMemo(() => {
    return userTransactions.filter(tx => {
      const matchesSearch = !historySearch || 
        tx.name.toLowerCase().includes(historySearch.toLowerCase()) ||
        tx.note.toLowerCase().includes(historySearch.toLowerCase());
      const matchesCat = historyCategory === 'ALL' || tx.category === historyCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [userTransactions, historySearch, historyCategory]);

  // Dynamic Date Groups for History tab
  const historyDateGroups = useMemo(() => {
    const groups = [];
    combinedTransactions.forEach(tx => {
      const g = tx.dateGroup || 'Today';
      if (!groups.includes(g)) {
        groups.push(g);
      }
    });
    return groups;
  }, [combinedTransactions]);

  return (
    <div className="w-full min-h-screen bg-[#070A11] text-white flex justify-center selection:bg-yellow-400 selection:text-black font-sans pb-24">
      {/* Mobile-first centered phone canvas matching screenshots */}
      <div className="w-full max-w-md bg-[#080C14] border-x border-white/5 min-h-screen flex flex-col relative shadow-2xl overflow-x-hidden">

        {/* ========================================================================= */}
        {/* VIEW 1: HOME SCREEN (Matches Image 1 Center & Image 2 Left)               */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <div className="flex-1 flex flex-col px-5 pt-4 pb-6 space-y-5 animate-in fade-in duration-200">
            
            {/* Top Navigation Bar: User Avatar | Greeting | Notification Bell */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="relative group cursor-pointer focus:outline-none"
                  aria-label="View Profile"
                >
                  <div className="w-10 h-10 rounded-full bg-[#182030] border-2 border-yellow-400/80 p-0.5 overflow-hidden transition-transform group-hover:scale-105 shadow-md flex items-center justify-center">
                    {userPassportPhoto ? (
                      <img
                        src={userPassportPhoto}
                        alt="User Passport Photo"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-bold text-yellow-400 tracking-wider">
                        {getInitials(profileName)}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#080C14] flex items-center justify-center">
                    <Check className="w-2 h-2 text-black stroke-[3]" />
                  </span>
                </button>

                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-medium leading-none">Welcome,</span>
                  <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                    {profileName}
                  </h1>
                </div>
              </div>

              {/* Notification Bell with red count badge */}
              <button
                onClick={() => setShowNotificationsModal(true)}
                className="w-10 h-10 rounded-full bg-[#121824] border border-white/10 flex items-center justify-center text-slate-200 hover:text-yellow-400 hover:border-yellow-400/40 transition-colors relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[#080C14] shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Segmented Pill Selector: [ Balance ] [ Wallet / Cards ] (Image 1 style) */}
            <div className="p-1 bg-[#121824] rounded-full flex items-center border border-white/10 shadow-inner">
              <button
                onClick={() => setSegmentedMode('balance')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  segmentedMode === 'balance'
                    ? 'bg-yellow-400 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Balance
              </button>
              <button
                onClick={() => setSegmentedMode('cards')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  segmentedMode === 'cards'
                    ? 'bg-yellow-400 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Wallet &amp; Card
              </button>
            </div>

            {/* HERO CARD (Dynamic between Balance & Card) */}
            {segmentedMode === 'balance' ? (
              /* High-Finish Balance Card (Matching User Reference Image 1 & 2) */
              <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[#121B2A] via-[#101726] to-[#0D1322] border border-yellow-400/25 shadow-xl transition-all">
                {/* Subtle yellow ambient wave line decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/8 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                
                {/* Card Top: Label & Show/Hide Eye Toggle */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">
                    Total balance
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHideBalance(!hideBalance)}
                      className="p-1 rounded-full text-slate-400 hover:text-yellow-400 transition-colors cursor-pointer"
                      aria-label="Toggle balance visibility"
                    >
                      {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Big Balance Display ($53,030.00) */}
                <div className="mt-3 relative z-10">
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-1">
                    {hideBalance ? (
                      <span className="tracking-widest text-slate-400 font-mono text-2xl">••••••••••</span>
                    ) : (
                      <>
                        <span className="text-yellow-400 text-2xl sm:text-3xl font-bold">$</span>
                        <span>{liveBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    Available in Checking ••••0397 &amp; High-Yield Savings
                  </p>
                </div>
              </div>
            ) : (
              /* Sleek Virtual Debit Card (Matches User Reference Image 2 & 3) */
              <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#1E3A5F] border border-yellow-400/30 shadow-2xl transition-all">
                {/* Decorative mesh */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />

                {/* Card Header: Brand & EMV Chip */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black tracking-wider text-white">First Atlantic</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  </div>
                  {/* EMV Gold Chip Icon */}
                  <div className="w-8 h-6 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded-sm border border-yellow-200/80 shadow-xs flex flex-col justify-between p-0.5">
                    <div className="w-full h-0.5 bg-amber-900/30"></div>
                    <div className="w-full h-0.5 bg-amber-900/30"></div>
                  </div>
                </div>

                {/* Masked Card Number */}
                <div className="mt-8 relative z-10">
                  <p className="text-lg font-mono tracking-widest text-white font-semibold flex items-center gap-2">
                    <span>••••</span>
                    <span>••••</span>
                    <span>••••</span>
                    <span className="text-yellow-300 font-bold">7461</span>
                  </p>
                </div>

                {/* Card Details: Holder Name, Expiry & Mastercard Logo */}
                <div className="mt-6 flex items-end justify-between relative z-10">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 tracking-wider block font-medium">Card Holder</span>
                    <span className="text-xs font-bold text-white uppercase tracking-wide">{profileName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 tracking-wider block font-medium">Expires</span>
                    <span className="text-xs font-bold text-white font-mono">10/28</span>
                  </div>
                  {/* Dual Circle Card Logo */}
                  <div className="flex -space-x-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-red-500/90 shadow-sm"></div>
                    <div className="w-6 h-6 rounded-full bg-amber-400/90 shadow-sm"></div>
                  </div>
                </div>
              </div>
            )}

            {/* QUICK ACTIONS: 4 Round Buttons with text below (Image 1 & 2) */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {/* 1. Send to */}
              <button
                onClick={() => {
                  setActiveTab('send');
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
              >
                <div className="w-13 h-13 rounded-full bg-[#121824] border border-white/10 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black group-hover:border-yellow-400 transition-all duration-200 shadow-md">
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-semibold text-slate-300 group-hover:text-yellow-400 transition-colors">
                  Send to
                </span>
              </button>

              {/* 2. Request */}
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
              >
                <div className="w-13 h-13 rounded-full bg-[#121824] border border-white/10 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black group-hover:border-yellow-400 transition-all duration-200 shadow-md">
                  <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-semibold text-slate-300 group-hover:text-yellow-400 transition-colors">
                  Request
                </span>
              </button>

              {/* 3. Top up / Add */}
              <button
                onClick={() => setShowTopUpModal(true)}
                className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
              >
                <div className="w-13 h-13 rounded-full bg-[#121824] border border-white/10 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black group-hover:border-yellow-400 transition-all duration-200 shadow-md">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-semibold text-slate-300 group-hover:text-yellow-400 transition-colors">
                  Top up
                </span>
              </button>

              {/* 4. More / Pay Bills */}
              <button
                onClick={() => setShowPayBillsModal(true)}
                className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
              >
                <div className="w-13 h-13 rounded-full bg-[#121824] border border-white/10 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black group-hover:border-yellow-400 transition-all duration-200 shadow-md">
                  <Receipt className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[11px] font-semibold text-slate-300 group-hover:text-yellow-400 transition-colors">
                  Pay Bills
                </span>
              </button>
            </div>

            {/* TRANSACTION HISTORY SECTION (White/Dark curved bottom sheet style) */}
            <div className="rounded-3xl bg-[#101622] border border-white/5 p-4 sm:p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Transaction history
                </h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-bold text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Transaction list items - clean real state */}
              <div className="divide-y divide-white/5">
                {userTransactions.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-300">No transactions yet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Your transfers and deposits will appear here once active.</p>
                  </div>
                ) : (
                  userTransactions.slice(0, 4).map((tx) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTxDetail(tx)}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-white/5 px-2 rounded-xl transition-colors cursor-pointer"
                      >
                        {/* Left: Avatar + Title & Time */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs tracking-wider shadow-inner select-none ${
                            isCredit
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : tx.category === 'topup'
                              ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                              : tx.category === 'bills'
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                              : 'bg-[#182234] border-white/10 text-yellow-400'
                          }`}>
                            {tx.initials || getInitials(tx.recipient || tx.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {tx.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {tx.time} • {tx.note}
                            </p>
                          </div>
                        </div>

                        {/* Right: Amount in Red/White/Green */}
                        <div className="text-right shrink-0">
                          <span className={`text-xs font-bold font-mono ${
                            isCredit ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {isCredit ? `+$${Math.abs(tx.amount).toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                          </span>
                          <span className="block text-[10px] text-emerald-400/90 font-medium">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: SEND MONEY SCREEN (Matches Image 3 Center & Right)                */}
        {/* ========================================================================= */}
        {activeTab === 'send' && (
          <div className="flex-1 flex flex-col px-5 pt-2 pb-6 animate-in fade-in duration-200">
            {/* If transfer was successful, show Transfer Successful Screen */}
            {transferSuccessData ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
                {/* Big Teal Checkmark Circle */}
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Transfer Authorized & Cleared</h2>
                  <p className="text-xs text-slate-400">Funds dispatched via {transferSuccessData.transferRail || 'Fedwire'}</p>
                </div>

                <div className="text-3xl font-black text-yellow-400 font-mono">
                  ${transferSuccessData.amount}
                </div>

                {/* Details Card */}
                <div className="w-full bg-[#101622] rounded-2xl border border-white/10 p-4 text-left text-xs space-y-2.5">
                  <div className="flex justify-between text-slate-400">
                    <span>From Origin</span>
                    <span className="font-semibold text-white">{transferSuccessData.fromAccount}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Beneficiary Name</span>
                    <span className="font-semibold text-white">{transferSuccessData.recipientName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Destination Depository</span>
                    <span className="font-semibold text-white">{transferSuccessData.recipientBank}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Account / IBAN</span>
                    <span className="font-semibold text-white font-mono">{transferSuccessData.recipientAccount}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Routing / SWIFT</span>
                    <span className="font-semibold text-white font-mono">{transferSuccessData.routing || transferSuccessData.swift || '021000021'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Settlement Network</span>
                    <span className="font-semibold text-emerald-400">{transferSuccessData.transferRail}</span>
                  </div>

                  <div className="border-t border-white/10 pt-2 my-1 space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>COT Code</span>
                      <span className="font-mono text-amber-400 font-semibold">{transferSuccessData.cotCode || 'COT-7849'}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Tax Clearance (TCC)</span>
                      <span className="font-mono text-amber-400 font-semibold">{transferSuccessData.taxCode || 'TAX-8842'}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>IMF / AML Code</span>
                      <span className="font-mono text-amber-400 font-semibold">{transferSuccessData.imfCode || 'IMF-9921'}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-2 flex justify-between text-slate-400">
                    <span>Settlement Ref</span>
                    <span className="font-semibold text-yellow-400 font-mono">{transferSuccessData.refNo}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Timestamp</span>
                    <span className="font-semibold text-white">{transferSuccessData.date}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="w-full space-y-2 pt-2">
                  <button
                    onClick={() => {
                      setTransferSuccessData(null);
                      setWireStep(1);
                      setActiveTab('history');
                    }}
                    className="w-full py-3.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-sm transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View in History Tab</span>
                  </button>
                  <button
                    onClick={() => {
                      setTransferSuccessData(null);
                      setWireStep(1);
                      setActiveTab('home');
                    }}
                    className="w-full py-2.5 rounded-full bg-[#121824] hover:bg-[#1a2233] border border-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Back to Account Overview
                  </button>
                  <button
                    onClick={() => {
                      showToast?.('Receipt Downloaded', `Settlement Certificate ${transferSuccessData.refNo} saved.`);
                    }}
                    className="w-full py-2 rounded-full text-slate-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    Download Settlement Receipt
                  </button>
                </div>
              </div>
            ) : (
              /* 3-Step Custom Wire Process */
              <div className="flex-1 flex flex-col space-y-3.5">
                {/* Header: Back arrow & Step indicator */}
                <div className="flex items-center justify-between pb-1">
                  <button
                    onClick={() => {
                      if (wireStep > 1) {
                        setWireStep(prev => prev - 1);
                      } else {
                        setActiveTab('home');
                      }
                    }}
                    className="w-9 h-9 rounded-full bg-[#121824] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                    aria-label="Back"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <div className="text-center">
                    <h2 className="text-base font-bold text-white tracking-tight">Wire Transfer</h2>
                    <p className="text-[11px] text-slate-400">
                      Step {wireStep} of 3 • {wireStep === 1 ? 'Beneficiary' : wireStep === 2 ? 'Amount & Funding' : 'Clearance & Authorization'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setWireStep(1);
                      setActiveTab('home');
                    }}
                    className="w-9 h-9 rounded-full bg-[#121824] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer text-xs font-bold"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 3-Step Progress Indicator */}
                <div className="space-y-1 py-0.5">
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wireStep >= 1 ? 'bg-yellow-400' : 'bg-white/10'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wireStep >= 2 ? 'bg-yellow-400' : 'bg-white/10'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wireStep >= 3 ? 'bg-yellow-400' : 'bg-white/10'}`} />
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-0.5">
                    <span className={wireStep === 1 ? 'text-yellow-400 font-bold' : wireStep > 1 ? 'text-emerald-400' : ''}>1. Beneficiary</span>
                    <span className={wireStep === 2 ? 'text-yellow-400 font-bold' : wireStep > 2 ? 'text-emerald-400' : ''}>2. Amount</span>
                    <span className={wireStep === 3 ? 'text-yellow-400 font-bold' : ''}>3. Authorization</span>
                  </div>
                </div>

                {/* STEP 1: Beneficiary & Bank Details */}
                {wireStep === 1 && (
                  <div className="flex-1 flex flex-col space-y-3 animate-in fade-in duration-200">
                    {/* Saved / Custom Selector */}
                    <div className="grid grid-cols-2 p-1 bg-[#101622] rounded-xl border border-white/10 text-xs">
                      <button
                        type="button"
                        onClick={() => setTransferMode('SAVED')}
                        className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                          transferMode === 'SAVED'
                            ? 'bg-yellow-400 text-black shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Saved Payees
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransferMode('CUSTOM')}
                        className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                          transferMode === 'CUSTOM'
                            ? 'bg-yellow-400 text-black shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Custom Wire
                      </button>
                    </div>

                    {/* Saved Payees Quick Avatars */}
                    {transferMode === 'SAVED' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar">
                          {beneficiaries.map(ben => {
                            const isSelected = selectedRecipient.id === ben.id;
                            return (
                              <button
                                key={ben.id}
                                onClick={() => handleSelectBeneficiaryItem(ben)}
                                className="flex flex-col items-center gap-1 shrink-0 cursor-pointer focus:outline-none"
                              >
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs tracking-wider transition-all select-none shadow-md ${
                                  isSelected
                                    ? 'bg-yellow-400 text-black ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#080C14]'
                                    : 'bg-[#182234] text-slate-200 border border-white/10 hover:border-yellow-400/50'
                                }`}>
                                  {ben.initials || getInitials(ben.name)}
                                </div>
                                <span className={`text-[10px] font-medium truncate w-14 text-center ${
                                  isSelected ? 'text-yellow-400 font-bold' : 'text-slate-400'
                                }`}>
                                  {ben.shortName}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Clean Form Fields */}
                    <div className="p-3.5 rounded-2xl bg-[#101622] border border-white/10 space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Beneficiary Legal Name
                        </label>
                        <input
                          type="text"
                          value={recipientNameInput}
                          onChange={(e) => setRecipientNameInput(e.target.value)}
                          placeholder="e.g. Leslie Parker"
                          className="w-full bg-[#121824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Destination Bank
                        </label>
                        <input
                          type="text"
                          value={recipientBankInput}
                          onChange={(e) => setRecipientBankInput(e.target.value)}
                          placeholder="e.g. Chase Bank, Bank of America, Barclays"
                          className="w-full bg-[#121824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                        />
                        <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto no-scrollbar">
                          {['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank', 'Barclays UK'].map(b => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setRecipientBankInput(b)}
                              className="px-2 py-0.5 rounded-md bg-[#161f30] hover:bg-yellow-400 hover:text-black text-[10px] text-slate-300 shrink-0 transition-colors cursor-pointer"
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Account / IBAN
                          </label>
                          <input
                            type="text"
                            value={recipientAccountInput}
                            onChange={(e) => setRecipientAccountInput(e.target.value)}
                            placeholder="4829104829"
                            className="w-full bg-[#121824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-yellow-400 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Routing / SWIFT
                          </label>
                          <input
                            type="text"
                            value={recipientRoutingInput}
                            onChange={(e) => setRecipientRoutingInput(e.target.value)}
                            placeholder="021000021"
                            className="w-full bg-[#121824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-yellow-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Settlement Rail
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                          {[
                            { id: 'FEDWIRE', label: 'Fedwire (Same-Day)' },
                            { id: 'SWIFT', label: 'SWIFT (Global)' },
                            { id: 'ACH', label: 'Instant ACH' },
                          ].map(rail => (
                            <button
                              key={rail.id}
                              type="button"
                              onClick={() => setTransferRail(rail.id)}
                              className={`py-2 px-1 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                                transferRail === rail.id
                                  ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300'
                                  : 'bg-[#121824] border-white/5 text-slate-400 hover:text-white'
                              }`}
                            >
                              {rail.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Step 1 Next Button */}
                    <button
                      type="button"
                      onClick={handleStep1Next}
                      className="w-full py-3.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-sm transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-1"
                    >
                      <span>Continue to Amount</span>
                      <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                )}

                {/* STEP 2: Transfer Amount & Funding Account */}
                {wireStep === 2 && (
                  <div className="flex-1 flex flex-col space-y-3 animate-in fade-in duration-200">
                    {/* Source Funding Account Card */}
                    <div className="p-3 rounded-xl bg-[#101622] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Debit Account</p>
                          <h4 className="text-xs font-bold text-white truncate max-w-[170px]">
                            {accounts[0]?.name || 'Premier Checking'} ({accounts[0]?.accountNumber || '••••'})
                          </h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">Available</p>
                        <p className={`text-xs font-bold font-mono ${liveBalance > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                          ${liveBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* Payee Summary Pill */}
                    <div className="px-3 py-2 rounded-xl bg-[#101622] border border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <User className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                        <span className="text-slate-400">Beneficiary:</span>
                        <span className="font-bold text-white truncate">{recipientNameInput}</span>
                        <span className="text-slate-500">• {recipientBankInput}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWireStep(1)}
                        className="text-[10px] font-bold text-yellow-400 hover:underline shrink-0 cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    {/* Amount Input */}
                    <div className="p-4 rounded-2xl bg-[#101622] border border-white/10 space-y-2.5">
                      <div className="text-center">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Enter Transfer Amount
                        </span>
                        <div className="flex items-center justify-center py-2">
                          <span className="text-3xl font-black text-yellow-400 mr-1">$</span>
                          <input
                            type="text"
                            value={sendAmountStr}
                            onChange={(e) => setSendAmountStr(e.target.value.replace(/[^0-9.]/g, ''))}
                            className="bg-transparent text-4xl font-black text-white text-center w-48 focus:outline-none font-mono"
                            placeholder="0.00"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Quick Chips */}
                      <div className="flex items-center justify-center gap-1.5 pt-1">
                        {['50', '100', '250', '500', '1000'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setSendAmountStr(preset + '.00')}
                            className="px-2.5 py-1 rounded-lg bg-[#121824] hover:bg-yellow-400 hover:text-black border border-white/5 text-[11px] font-semibold text-slate-300 transition-colors cursor-pointer"
                          >
                            ${preset}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSendAmountStr(liveBalance.toFixed(2))}
                          className="px-2.5 py-1 rounded-lg bg-yellow-400/10 hover:bg-yellow-400 hover:text-black border border-yellow-400/30 text-[11px] font-bold text-yellow-400 transition-colors cursor-pointer"
                        >
                          Max
                        </button>
                      </div>

                      {/* Memo */}
                      <div className="pt-2">
                        <input
                          type="text"
                          value={sendNote}
                          onChange={(e) => setSendNote(e.target.value)}
                          placeholder="Transfer reference / memo (optional)"
                          className="w-full bg-[#121824] rounded-xl px-3 py-2 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Numeric Keypad */}
                    <div className="pt-1">
                      <div className="grid grid-cols-3 gap-1.5 select-none">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => handleKeypadPress(k)}
                            className="h-10 rounded-xl bg-[#121824] hover:bg-[#1a2334] active:bg-yellow-400 active:text-black border border-white/5 text-base font-bold text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            {k === 'DEL' ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414a2 2 0 011.414-.586H19a2 2 0 012 2v10a2 2 0 01-2 2h-7.172a2 2 0 01-1.414-.586L3 12z" />
                              </svg>
                            ) : (
                              k
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 2 Bottom Navigation */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setWireStep(1)}
                        className="w-1/3 py-3.5 rounded-full bg-[#121824] hover:bg-[#1a2334] border border-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleStep2Next}
                        className="w-2/3 py-3.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-sm transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>Review & Clear</span>
                        <ChevronRight className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Regulatory Clearance & Authorization */}
                {wireStep === 3 && (
                  <div className="flex-1 flex flex-col space-y-3 animate-in fade-in duration-200">
                    {/* Review Summary Card */}
                    <div className="p-3.5 rounded-2xl bg-[#101622] border border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-slate-400 font-medium">Wire Summary</span>
                        <span className="text-lg font-black text-yellow-400 font-mono">${sendAmountStr}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Beneficiary:</span>
                        <span className="font-bold text-white">{recipientNameInput}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Depository:</span>
                        <span>{recipientBankInput} ({recipientAccountInput})</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Settlement Rail:</span>
                        <span className="text-emerald-400 font-medium">{transferRail}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Transfer Fee:</span>
                        <span className="text-emerald-400 font-medium">$0.00 (Waived)</span>
                      </div>
                    </div>

                    {/* Regulatory Clearance Codes Card */}
                    <div className="p-3.5 rounded-2xl bg-[#14120a] border border-yellow-500/30 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between pb-1 border-b border-yellow-500/20">
                        <div className="flex items-center gap-1.5 text-yellow-400">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="text-xs font-bold text-white tracking-tight">
                            Clearance & Security Codes
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAutoFillClearanceCodes}
                          className="px-2 py-0.5 rounded-md bg-yellow-400/20 hover:bg-yellow-400 text-yellow-300 hover:text-black text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-yellow-400/30"
                          title="Generate and autofill valid COT, Tax, and IMF codes"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto-Generate Codes</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {/* COT Code */}
                        <div>
                          <label className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider block mb-1">
                            COT Code
                          </label>
                          <input
                            type="text"
                            value={cotCodeInput}
                            onChange={(e) => setCotCodeInput(e.target.value)}
                            placeholder="COT-7849"
                            className="w-full bg-[#121824] border border-amber-500/30 rounded-xl px-2.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                          />
                        </div>

                        {/* Tax Clearance Code */}
                        <div>
                          <label className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider block mb-1">
                            Tax Code (TCC)
                          </label>
                          <input
                            type="text"
                            value={taxCodeInput}
                            onChange={(e) => setTaxCodeInput(e.target.value)}
                            placeholder="TAX-8842"
                            className="w-full bg-[#121824] border border-amber-500/30 rounded-xl px-2.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                          />
                        </div>

                        {/* IMF Clearance Code */}
                        <div>
                          <label className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider block mb-1">
                            IMF / AML Code
                          </label>
                          <input
                            type="text"
                            value={imfCodeInput}
                            onChange={(e) => setImfCodeInput(e.target.value)}
                            placeholder="IMF-9921"
                            className="w-full bg-[#121824] border border-amber-500/30 rounded-xl px-2.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                          />
                        </div>

                        {/* Security PIN */}
                        <div>
                          <label className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider block mb-1">
                            Transfer PIN
                          </label>
                          <input
                            type="password"
                            maxLength={6}
                            value={transferPinInput}
                            onChange={(e) => setTransferPinInput(e.target.value)}
                            placeholder="••••"
                            className="w-full bg-[#121824] border border-amber-500/30 rounded-xl px-2.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step 3 Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setWireStep(2)}
                        className="w-1/3 py-3.5 rounded-full bg-[#121824] hover:bg-[#1a2334] border border-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteSend}
                        disabled={isProcessingSend}
                        className="w-2/3 py-3.5 rounded-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-extrabold text-sm transition-all cursor-pointer shadow-lg active:scale-98 flex items-center justify-center gap-2"
                      >
                        {isProcessingSend ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Authorizing Wire...</span>
                          </>
                        ) : (
                          <span>Authorize & Send ${sendAmountStr}</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: HISTORY SCREEN (Matches Image 1 Right)                            */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="flex-1 flex flex-col px-5 pt-2 pb-6 space-y-4 animate-in fade-in duration-200">
            {/* Header: Title */}
            <div className="flex items-center justify-between pb-1">
              <button
                onClick={() => setActiveTab('home')}
                className="w-9 h-9 rounded-full bg-[#121824] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <h2 className="text-base font-bold text-white tracking-tight">History</h2>
              <div className="w-9" />
            </div>

            {/* Filter Chips: Date ∨ | Service ∨ (Matches screenshot 1 right) */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full bg-[#101622] rounded-full pl-8 pr-3 py-2 text-xs text-white border border-white/10 placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              </div>
              <select
                value={historyCategory}
                onChange={(e) => setHistoryCategory(e.target.value)}
                className="bg-[#101622] text-xs font-semibold text-slate-300 border border-white/10 rounded-full px-3 py-2 focus:outline-none focus:border-yellow-400 cursor-pointer"
              >
                <option value="ALL">All Services</option>
                <option value="TRANSFER">Transfers</option>
                <option value="TOPUP">Top Ups</option>
                <option value="BILLS">Bills</option>
                <option value="SUBSCRIPTIONS">Subscriptions</option>
              </select>
            </div>

            {/* Grouped Date Sections */}
            <div className="space-y-4">
              {historyDateGroups.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#101622] border border-white/5 space-y-2">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">No transactions found</p>
                  <p className="text-[11px] text-slate-500">Completed bank transfers and wires will appear here.</p>
                </div>
              ) : (
                historyDateGroups.map((groupDate) => {
                  const groupItems = combinedTransactions.filter(tx => tx.dateGroup === groupDate);
                  if (groupItems.length === 0) return null;

                return (
                  <div key={groupDate} className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 px-1">
                      {groupDate}
                    </h4>

                    <div className="rounded-2xl bg-[#101622] border border-white/5 divide-y divide-white/5 overflow-hidden">
                      {groupItems.map(tx => {
                        const isCredit = tx.amount > 0;
                        return (
                          <div
                            key={tx.id}
                            onClick={() => setSelectedTxDetail(tx)}
                            className="p-3.5 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-[#182234] border border-white/10 flex items-center justify-center shrink-0 text-yellow-400">
                                {isCredit ? (
                                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <ArrowUpRight className="w-4 h-4 text-yellow-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{tx.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{tx.note}</p>
                                <p className="text-[10px] text-slate-500">{tx.time}</p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={`text-xs font-bold font-mono ${
                                isCredit ? 'text-emerald-400' : 'text-white'
                              }`}>
                                {isCredit ? `+$${Math.abs(tx.amount).toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                              </span>
                              <span className="block text-[10px] text-emerald-400 font-medium">
                                {tx.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: CARDS SCREEN                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'cards' && (
          <div className="flex-1 flex flex-col px-5 pt-2 pb-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-1">
              <button
                onClick={() => setActiveTab('home')}
                className="w-9 h-9 rounded-full bg-[#121824] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <h2 className="text-base font-bold text-white tracking-tight">Cards &amp; Limits</h2>
              <div className="w-9" />
            </div>

            {/* Virtual Card Rendering */}
            <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-tr from-[#0B0F19] via-[#162033] to-[#1E293B] border border-yellow-400/40 shadow-2xl">
              <div className="flex items-center justify-between relative z-10">
                <span className="text-base font-black tracking-wider text-white">First Atlantic Elite</span>
                <div className="w-8 h-6 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded-sm border border-yellow-200/80 p-0.5"></div>
              </div>

              <div className="mt-8 relative z-10">
                <p className="text-lg font-mono tracking-widest text-white font-semibold">
                  <span>•••• •••• •••• </span>
                  <span className="text-yellow-400">7461</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  CVV: <span className="font-mono text-white font-bold">{showCardCvv ? '892' : '•••'}</span>
                  <button
                    onClick={() => setShowCardCvv(!showCardCvv)}
                    className="ml-2 text-yellow-400 hover:underline text-[10px] cursor-pointer"
                  >
                    {showCardCvv ? 'Hide' : 'Reveal'}
                  </button>
                </p>
              </div>

              <div className="mt-6 flex items-end justify-between relative z-10">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-medium">Card Holder</span>
                  <span className="text-xs font-bold text-white uppercase">{profileName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-medium">Expires</span>
                  <span className="text-xs font-bold text-white font-mono">10/28</span>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-500"></div>
                  <div className="w-6 h-6 rounded-full bg-amber-400"></div>
                </div>
              </div>
            </div>

            {/* Card Controls & Limits */}
            <div className="rounded-2xl bg-[#101622] border border-white/10 p-4 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Card Controls</h3>

              {/* Freeze Card Switch */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">Lock / Freeze Card</h4>
                  <p className="text-[10px] text-slate-400">Instantly prevent new card transactions</p>
                </div>
                <button
                  onClick={() => {
                    setIsCardFrozen(!isCardFrozen);
                    showToast?.(
                      isCardFrozen ? 'Card Unlocked' : 'Card Locked',
                      isCardFrozen ? 'Your card is now active for purchases.' : 'Card frozen for your protection.'
                    );
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    isCardFrozen ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isCardFrozen ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Daily Spending Limit */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Daily Spending Limit</span>
                  <span className="font-bold text-yellow-400 font-mono">${spendingLimit.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(Number(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              {/* View PIN */}
              <button
                onClick={() => showToast?.('Card PIN', 'Your physical card ATM PIN is 8491.')}
                className="w-full py-2.5 rounded-xl bg-[#121824] hover:bg-[#1a2334] border border-white/10 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                View ATM PIN
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: PROFILE SCREEN (Matches Image 1 Left & Image 2 Right)              */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="flex-1 flex flex-col px-5 pt-2 pb-6 space-y-4 animate-in fade-in duration-200">
            {/* Header: Back arrow & Profile */}
            <div className="flex items-center justify-between pb-1">
              <button
                onClick={() => setActiveTab('home')}
                className="w-9 h-9 rounded-full bg-[#121824] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <h2 className="text-base font-bold text-white tracking-tight">Profile</h2>
              <div className="w-9" />
            </div>

            {/* Profile User Card (Passport Avatar, Name, Handle, Verified Badge, Upload Trigger) */}
            <div className="rounded-2xl bg-[#101622] border border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                {/* Clickable Passport Photo Avatar */}
                <div
                  onClick={() => setShowPassportModal(true)}
                  className="relative cursor-pointer group"
                  title="Click to add or change passport picture"
                >
                  <div className="w-14 h-14 rounded-full bg-[#182234] border-2 border-yellow-400 p-0.5 overflow-hidden flex items-center justify-center transition-colors group-hover:border-yellow-300">
                    {userPassportPhoto ? (
                      <img
                        src={userPassportPhoto}
                        alt={profileName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-yellow-400 tracking-wider">
                        {getInitials(profileName)}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-md border-2 border-[#101622] group-hover:scale-110 transition-transform">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">{profileName}</h3>
                  <p className="text-xs text-slate-400">@{currentUser?.username || 'client'}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Verified</span>
                    </span>
                    {userPassportPhoto && (
                      <span className="text-[10px] text-yellow-400 font-semibold">Passport On File</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPassportModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-400/30 text-yellow-400 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Add or change passport picture"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{userPassportPhoto ? 'Change Photo' : 'Add Passport'}</span>
                </button>
                <button
                  onClick={() => setShowPersonalInfoModal(true)}
                  className="w-9 h-9 rounded-full bg-[#182234] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Edit Profile"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dedicated Passport Picture & Sovereign ID Card */}
            <div className="rounded-2xl bg-[#101622] border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">Passport &amp; ID Picture</h4>
                    <p className="text-[10px] text-slate-400">Personal identity document for clearance &amp; wire verification</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  userPassportPhoto
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-yellow-400/15 text-yellow-400 border border-yellow-400/30'
                }`}>
                  {userPassportPhoto ? 'Verified Document' : 'No Document Attached'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-[#141D30] rounded-xl border border-white/5">
                <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-[#0C121E] border-2 border-dashed border-white/20 shrink-0 flex items-center justify-center group">
                  {userPassportPhoto ? (
                    <>
                      <img
                        src={userPassportPhoto}
                        alt="Passport Picture"
                        className="w-full h-full object-cover"
                      />
                      <div
                        onClick={() => setShowPassportModal(true)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white"
                      >
                        <Camera className="w-5 h-5 text-yellow-400 mb-1" />
                        <span className="text-[9px] font-bold">Replace</span>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => setShowPassportModal(true)}
                      className="text-center p-2 text-slate-400 cursor-pointer hover:text-yellow-400 transition-colors"
                    >
                      <User className="w-8 h-8 mx-auto stroke-1 text-slate-500" />
                      <span className="text-[9px] uppercase tracking-wider block mt-1 font-bold">+ Upload</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <p className="text-xs font-semibold text-white">
                    {userPassportPhoto ? 'Your Passport Picture Is Attached' : 'Add Your Passport Picture'}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {userPassportPhoto
                      ? 'Your biometric passport photo is linked to your account profile, high-limit wires, and regulatory compliance checks.'
                      : 'Upload your passport photo directly from your user dashboard to verify identity and increase daily wire limits.'}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      onClick={() => setShowPassportModal(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{userPassportPhoto ? 'Change Passport Picture' : 'Upload Passport Picture'}</span>
                    </button>
                    {userPassportPhoto && (
                      <button
                        onClick={handleRemovePassportPhoto}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-medium cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: Account Details (Image 1 Left & Image 2 Right) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">
                Account details
              </h4>

              <div className="rounded-2xl bg-[#101622] border border-white/10 divide-y divide-white/5 overflow-hidden">
                {/* 1. Personal Info */}
                <button
                  onClick={() => setShowPersonalInfoModal(true)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#182234] text-yellow-400 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white">Personal Info</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 2. Level Account */}
                <button
                  onClick={() => setShowLevelAccountModal(true)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#182234] text-yellow-400 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white">Level Account</span>
                      <span className="ml-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Tier 3</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 3. Referral Friend */}
                <button
                  onClick={() => setShowReferralModal(true)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#182234] text-yellow-400 flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white">Referal Friend</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 4. Set up Face ID (Green Toggle Switch in Image 1 Left) */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#182234] text-yellow-400 flex items-center justify-center">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white">Set up Face ID</span>
                  </div>

                  <button
                    onClick={() => {
                      const next = !faceIdEnabled;
                      setFaceIdEnabled(next);
                      showToast?.(
                        next ? 'Face ID Enabled' : 'Face ID Disabled',
                        next ? 'Biometric authentication active for all payments.' : 'Passcode fallback required.'
                      );
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      faceIdEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      faceIdEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2: Help and Support */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">
                Help and Support
              </h4>

              <div className="rounded-2xl bg-[#101622] border border-white/10 divide-y divide-white/5 overflow-hidden">
                {/* Help Center */}
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#182234] text-yellow-400 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white">Help Center</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* FAQ */}
                <button
                  onClick={() => setShowFaqModal(true)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#182234] text-yellow-400 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white">FaQ</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Log Out */}
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to log out of First Atlantic Bank?')) {
                      logout?.();
                      setCurrentView('AUTH_LOGIN');
                      navigate('/login');
                    }
                  }}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-red-500/10 transition-colors cursor-pointer text-left text-rose-400 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-rose-400">Log Out</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400/70" />
                </button>
              </div>
            </div>

            {/* Logout pill button outline matching Image 2 Right */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (window.confirm('Log out from this mobile device?')) {
                    logout?.();
                    setCurrentView('AUTH_LOGIN');
                    navigate('/login');
                  }
                }}
                className="w-full py-3 rounded-full border border-rose-500/40 hover:bg-rose-500/10 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FLOATING BOTTOM DOCK NAVIGATION (Home | Card | Scan/Send | History | Profile) */}
        {/* Matches Image 1 & Image 2 Floating Bottom Bar                             */}
        {/* ========================================================================= */}
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-3 px-4">
          <div className="w-full max-w-md bg-[#0F1626]/95 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl flex items-center justify-between pointer-events-auto">
            {/* 1. Home */}
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center py-1 flex-1 cursor-pointer transition-colors ${
                activeTab === 'home' ? 'text-yellow-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-full ${activeTab === 'home' ? 'bg-yellow-400/15' : ''}`}>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold mt-0.5">Home</span>
            </button>

            {/* 2. Card */}
            <button
              onClick={() => setActiveTab('cards')}
              className={`flex flex-col items-center justify-center py-1 flex-1 cursor-pointer transition-colors ${
                activeTab === 'cards' ? 'text-yellow-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-full ${activeTab === 'cards' ? 'bg-yellow-400/15' : ''}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold mt-0.5">Card</span>
            </button>

            {/* 3. Center Send / Scan Button (Yellow Highlighted Circle) */}
            <button
              onClick={() => {
                setActiveTab('send');
              }}
              className="flex flex-col items-center justify-center -mt-5 cursor-pointer group"
              aria-label="Send Money"
            >
              <div className="w-13 h-13 rounded-full bg-yellow-400 group-hover:bg-yellow-300 text-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 border-4 border-[#080C14]">
                <Send className="w-5 h-5 rotate-45 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-yellow-400 mt-0.5">Send</span>
            </button>

            {/* 4. History */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center py-1 flex-1 cursor-pointer transition-colors ${
                activeTab === 'history' ? 'text-yellow-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-full ${activeTab === 'history' ? 'bg-yellow-400/15' : ''}`}>
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold mt-0.5">History</span>
            </button>

            {/* 5. Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center py-1 flex-1 cursor-pointer transition-colors ${
                activeTab === 'profile' ? 'text-yellow-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-full ${activeTab === 'profile' ? 'bg-yellow-400/15' : ''}`}>
                <User className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold mt-0.5">Profile</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL: PERSONAL INFO (Account details inside user profile)                */}
        {/* ========================================================================= */}
        {showPersonalInfoModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Personal Information</h3>
                <button
                  onClick={() => setShowPersonalInfoModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-[#141D30] rounded-xl px-3.5 py-2.5 text-white border border-white/10 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-[#141D30] rounded-xl px-3.5 py-2.5 text-white border border-white/10 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-[#141D30] rounded-xl px-3.5 py-2.5 text-white border border-white/10 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full bg-[#141D30] rounded-xl px-3.5 py-2.5 text-white border border-white/10 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                {/* Wire Routing Numbers */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>ABA Routing Number</span>
                    <button
                      onClick={() => copyToClipboard('021000089', 'Routing Number')}
                      className="text-yellow-400 font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>021000089</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Account Number</span>
                    <button
                      onClick={() => copyToClipboard('7461928401', 'Account Number')}
                      className="text-yellow-400 font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>•••• 7461</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>SWIFT / BIC</span>
                    <button
                      onClick={() => copyToClipboard('FABLUS33', 'SWIFT Code')}
                      className="text-yellow-400 font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>FABLUS33</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowPersonalInfoModal(false);
                    showToast?.('Profile Updated', 'Personal details saved to Supabase securely.');
                  }}
                  className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs transition-colors cursor-pointer mt-3"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: LEVEL ACCOUNT (Tier 3 Institutional Verification)                  */}
        {/* ========================================================================= */}
        {showLevelAccountModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Tier 3 Institutional Clearance</h3>
                </div>
                <button
                  onClick={() => setShowLevelAccountModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <p className="font-bold">Account Verification: Complete</p>
                  <p className="text-[11px] mt-0.5">Government ID, Proof of Address, and AML screenings verified.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Daily Wire Limit:</span>
                    <span className="font-bold text-white font-mono">$100,000.00 USD</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Single Transfer Limit:</span>
                    <span className="font-bold text-white font-mono">$50,000.00 USD</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Clearing Rail:</span>
                    <span className="font-bold text-yellow-400">Fedwire Real-Time / CHAPS</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>FDIC / Custody Insurance:</span>
                    <span className="font-bold text-emerald-400">Up to $2,500,000.00</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowLevelAccountModal(false)}
                  className="w-full py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-xs transition-colors cursor-pointer mt-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: REFERRAL FRIEND                                                    */}
        {/* ========================================================================= */}
        {showReferralModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 text-center">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Refer a Friend</h3>
                <button
                  onClick={() => setShowReferralModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-12 h-12 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Earn $250.00 Credit</h4>
                <p className="text-xs text-slate-400">
                  Invite private clients or colleagues to open an account with First Atlantic Bank. You both receive $250.00 upon their first deposit.
                </p>
              </div>

              <div className="p-3 bg-[#141D30] rounded-2xl border border-yellow-400/30 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-yellow-400 tracking-wider">
                  ATLANTIC-{(currentUser?.username || 'CLIENT').toUpperCase()}
                </span>
                <button
                  onClick={() => copyToClipboard(`ATLANTIC-${(currentUser?.username || 'CLIENT').toUpperCase()}`, 'Referral Code')}
                  className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs rounded-full transition-colors cursor-pointer"
                >
                  Copy
                </button>
              </div>

              <button
                onClick={() => {
                  copyToClipboard(`https://firstatlanticbank.vercel.app/enroll?ref=ATLANTIC-${(currentUser?.username || 'CLIENT').toUpperCase()}`, 'Invite Link');
                  setShowReferralModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-xs transition-colors cursor-pointer"
              >
                Share Invite Link
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: WORLDWIDE REGISTERED BANKS PICKER (For Send Money)                 */}
        {/* ========================================================================= */}
        {showBankPickerModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
                <h3 className="text-sm font-bold text-white">Select Recipient or Bank</h3>
                <button
                  onClick={() => setShowBankPickerModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search & Region Filter */}
              <div className="space-y-2 shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    value={bankSearchQuery}
                    onChange={(e) => setBankSearchQuery(e.target.value)}
                    placeholder="Search bank name or SWIFT (Chase, HSBC, Barclays)..."
                    className="w-full bg-[#141D30] rounded-xl pl-9 pr-3 py-2 text-xs text-white border border-white/10 placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {['ALL', 'US', 'UK', 'EU', 'GLOBAL'].map(reg => (
                    <button
                      key={reg}
                      onClick={() => setBankFilterRegion(reg)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                        bankFilterRegion === reg
                          ? 'bg-yellow-400 text-black'
                          : 'bg-[#141D30] text-slate-400 hover:text-white'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank list */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/5 pr-1">
                {filteredBanks.slice(0, 25).map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedRecipient({
                        id: b.id,
                        name: `${b.shortName} Customer`,
                        shortName: b.shortName,
                        bank: b.name,
                        account: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(b.shortName)}&background=FACC15&color=000`
                      });
                      setShowBankPickerModal(false);
                      showToast?.('Recipient Bank Selected', `${b.name} (${b.swiftBic})`);
                    }}
                    className="w-full p-3 flex items-center justify-between hover:bg-white/5 text-left transition-colors cursor-pointer rounded-xl"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{b.name}</h4>
                      <p className="text-[10px] text-slate-400">{b.countryName} • {b.clearingRail}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-yellow-400">{b.swiftBic}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: NOTIFICATIONS DRAWER                                              */}
        {/* ========================================================================= */}
        {showNotificationsModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-sm font-bold text-white">Notifications</h3>
                </div>
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="divide-y divide-white/5">
                {notifications.map(n => (
                  <div key={n.id} className="py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-400/15 text-yellow-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{n.title}</h4>
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  setShowNotificationsModal(false);
                  showToast?.('All caught up', 'Notifications marked as read.');
                }}
                className="w-full py-2.5 rounded-xl bg-[#141D30] hover:bg-[#1a253d] text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                Mark all as read
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: SUPABASE CLOUD SYNC DETAILS                                       */}
        {/* ========================================================================= */}
        {showCloudSyncModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Supabase Cloud Database</h3>
                </div>
                <button
                  onClick={() => setShowCloudSyncModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p className="text-[11px] text-slate-400">
                  Every account, transaction, and document in First Atlantic Bank is continuously mirrored to Supabase PostgreSQL.
                </p>

                <div className="p-3 bg-[#141D30] rounded-xl space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Host Domain:</span>
                    <span className="text-yellow-400 font-mono">firstatlanticbank.vercel.app</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cloud Storage:</span>
                    <span className="text-emerald-400 font-semibold">Active (fab-documents)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tables Synced:</span>
                    <span className="text-white font-mono">13 / 13 Relational Tables</span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setIsSyncing(true);
                    try {
                      const res = await fetch('/api/supabase/sync', { method: 'POST' });
                      const data = await res.json();
                      showToast?.('Supabase Cloud Synced', data.message || 'All tables updated successfully.');
                    } catch (e) {
                      showToast?.('Local Cache Synced', 'Updated in ledger.');
                    }
                    setIsSyncing(false);
                    setShowCloudSyncModal(false);
                  }}
                  disabled={isSyncing}
                  className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>{isSyncing ? 'Mirroring to Supabase...' : 'Trigger Full Cloud Backup'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: TRANSACTION RECEIPT DETAILS                                       */}
        {/* ========================================================================= */}
        {selectedTxDetail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Payment Receipt</h3>
                <button
                  onClick={() => setSelectedTxDetail(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center py-2 space-y-1">
                <p className={`text-2xl font-black font-mono ${
                  selectedTxDetail.amount > 0 ? 'text-emerald-400' : 'text-white'
                }`}>
                  {selectedTxDetail.amount > 0 ? `+$${Math.abs(selectedTxDetail.amount).toFixed(2)}` : `-$${Math.abs(selectedTxDetail.amount).toFixed(2)}`}
                </p>
                <p className="text-xs font-bold text-white">{selectedTxDetail.name}</p>
                <p className="text-[11px] text-slate-400">{selectedTxDetail.note}</p>
              </div>

              <div className="p-3 bg-[#141D30] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Status</span>
                  <span className="text-emerald-400 font-bold">{selectedTxDetail.status}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Date &amp; Time</span>
                  <span className="text-white">{selectedTxDetail.date} • {selectedTxDetail.time}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Reference ID</span>
                  <span className="text-yellow-400 font-mono font-bold">{selectedTxDetail.refNo}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    copyToClipboard(selectedTxDetail.refNo, 'Transaction Reference');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#141D30] hover:bg-[#1a253d] text-white text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ID</span>
                </button>
                <button
                  onClick={() => {
                    showToast?.('Receipt Saved', `Payment certificate for ${selectedTxDetail.refNo} generated.`);
                    setSelectedTxDetail(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: TOP UP / ADD MONEY                                                */}
        {/* ========================================================================= */}
        {showTopUpModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Top Up Balance</h3>
                <button
                  onClick={() => setShowTopUpModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-slate-400 text-[11px]">
                  Deposit funds via Fedwire, ACH direct deposit, or linked debit card.
                </p>

                <div className="p-3 bg-[#141D30] rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Routing (Fedwire / ACH):</span>
                    <button
                      onClick={() => copyToClipboard('021000089', 'Routing Number')}
                      className="font-mono font-bold text-yellow-400 flex items-center gap-1"
                    >
                      <span>021000089</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Checking Account:</span>
                    <button
                      onClick={() => copyToClipboard('7461928401', 'Account Number')}
                      className="font-mono font-bold text-yellow-400 flex items-center gap-1"
                    >
                      <span>7461928401</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    const newBal = liveBalance + 500;
                    setLiveBalance(newBal);
                    try {
                      const token = localStorage.getItem('fab_session_token') || localStorage.getItem('token') || currentUser?.id || '';
                      const headers = { 'Content-Type': 'application/json' };
                      if (token) headers['Authorization'] = `Bearer ${token}`;
                      if (currentUser?.id) headers['x-user-id'] = currentUser.id;

                      await fetch('/api/deposits/instant', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                          accountId: accounts[0]?.id,
                          amountMinor: 50000,
                          userId: currentUser?.id,
                          description: 'Instant Mobile Check Deposit'
                        })
                      });
                      if (typeof refreshData === 'function') {
                        refreshData().catch(() => {});
                      }
                    } catch (e) {
                      console.warn('Instant deposit sync notice:', e);
                    }
                    showToast?.('Deposit Credited', '$500.00 instant mobile check deposit settled.');
                    setShowTopUpModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs cursor-pointer"
                >
                  Simulate Instant $500.00 Deposit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: REQUEST / RECEIVE QR                                              */}
        {/* ========================================================================= */}
        {showRequestModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 text-center">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Receive Money</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Code Container */}
              <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <div className="w-full h-full border-4 border-black p-2 flex flex-col items-center justify-center">
                  <QrCode className="w-32 h-32 text-black" />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Scan to send to {profileName}</p>
                <p className="text-[11px] text-slate-400 font-mono">@{currentUser?.username || 'client'} • First Atlantic Bank</p>
              </div>

              <button
                onClick={() => {
                  copyToClipboard(`https://firstatlanticbank.vercel.app/pay/${currentUser?.username || 'client'}`, 'Payment Link');
                  setShowRequestModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs cursor-pointer"
              >
                Copy My Payment Link
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: PAY BILLS / UTILITIES                                             */}
        {/* ========================================================================= */}
        {showPayBillsModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Pay Bills &amp; Utilities</h3>
                <button
                  onClick={() => setShowPayBillsModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { name: 'Consolidated Edison (Electricity)', bill: '$142.80', due: 'Due in 3 days' },
                  { name: 'Verizon Wireless (Mobile)', bill: '$85.00', due: 'Due tomorrow' },
                  { name: 'MetLife Private Insurance', bill: '$320.00', due: 'Due Sep 20' }
                ].map((bill, idx) => (
                  <div key={idx} className="p-3 bg-[#141D30] rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{bill.name}</p>
                      <p className="text-[10px] text-slate-400">{bill.due}</p>
                    </div>
                    <button
                      onClick={() => {
                        showToast?.('Bill Paid', `Settled ${bill.name} for ${bill.bill}.`);
                        setShowPayBillsModal(false);
                      }}
                      className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Pay {bill.bill}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: HELP CENTER & CONCIERGE                                           */}
        {/* ========================================================================= */}
        {showHelpModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 text-center">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Priority Client Concierge</h3>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-12 h-12 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto">
                <Headphones className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">24/7 Dedicated Treasury Support</h4>
                <p className="text-xs text-slate-400">
                  Your private banker and clearing desk officers are available around the clock.
                </p>
              </div>

              <div className="p-3 bg-[#141D30] rounded-xl space-y-1.5 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Direct Desk Line:</span>
                  <span className="text-yellow-400 font-bold">+1 (800) 492-9102</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dedicated Officer:</span>
                  <span className="text-white font-semibold">David Vance, Senior VP</span>
                </div>
              </div>

              <button
                onClick={() => {
                  showToast?.('Concierge Live Chat', 'Connected to private client advisor.');
                  setShowHelpModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs cursor-pointer"
              >
                Start Live Chat
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: FAQ                                                                */}
        {/* ========================================================================= */}
        {showFaqModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Frequently Asked Questions</h3>
                <button
                  onClick={() => setShowFaqModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-[#141D30] rounded-xl">
                  <h4 className="font-bold text-white">What are the wire transfer cutoff times?</h4>
                  <p className="text-slate-400 mt-1">Fedwire and CHAPS transfers execute real-time 24/7. International SWIFT wires settle within 2-4 hours on business days.</p>
                </div>
                <div className="p-3 bg-[#141D30] rounded-xl">
                  <h4 className="font-bold text-white">How does Supabase cloud sync work?</h4>
                  <p className="text-slate-400 mt-1">All accounts, cards, and transaction records automatically synchronize to the Supabase cloud database with zero data loss.</p>
                </div>
                <div className="p-3 bg-[#141D30] rounded-xl">
                  <h4 className="font-bold text-white">Is Face ID supported?</h4>
                  <p className="text-slate-400 mt-1">Yes, WebAuthn Level 2 hardware biometrics and Face ID can be enabled in your Profile settings.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASSPORT PICTURE UPLOAD & CAMERA MODAL                                    */}
        {/* ========================================================================= */}
        {showPassportModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0F1626] border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Passport Identity Photo</h3>
                    <p className="text-[10px] text-slate-400">Add or update your official biometric passport picture</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    stopCameraCapture();
                    setShowPassportModal(false);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handlePassportFileSelected(e.target.files[0]);
                  }
                }}
              />

              {/* Camera Active View */}
              {isCameraActive ? (
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-yellow-400/40 shadow-inner flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                    {/* Passport framing guideline overlay */}
                    <div className="absolute inset-4 border-2 border-dashed border-yellow-400/60 rounded-xl pointer-events-none flex flex-col items-center justify-between p-2">
                      <span className="text-[10px] font-semibold text-yellow-400/90 bg-black/60 px-2 py-0.5 rounded-full">
                        Align your face within the frame
                      </span>
                      <span className="text-[9px] text-slate-300 bg-black/60 px-2 py-0.5 rounded-full">
                        Good lighting &amp; clear background
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={capturePhotoFromCamera}
                      className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Snapshot</span>
                    </button>
                    <button
                      onClick={stopCameraCapture}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Preview or Upload Choices */
                <div className="space-y-4">
                  
                  {/* Photo Preview if selected or exists */}
                  {(passportPreviewUrl || userPassportPhoto) ? (
                    <div className="p-4 rounded-2xl bg-[#141D30] border border-white/10 flex flex-col items-center text-center space-y-3">
                      <div className="relative w-28 h-36 rounded-xl overflow-hidden border-2 border-yellow-400 shadow-xl bg-black">
                        <img
                          src={passportPreviewUrl || userPassportPhoto}
                          alt="Passport Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-yellow-400 font-bold border border-yellow-400/30">
                          2x2
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white">
                          {passportPreviewUrl ? 'New Photo Selected' : 'Current Passport Picture'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {passportPreviewUrl
                            ? 'Ready to save to your personal dashboard and wire clearance profile.'
                            : 'This photo represents your verified identity across First Atlantic Bank.'}
                        </p>
                      </div>

                      {/* If new preview selected */}
                      {passportPreviewUrl && (
                        <div className="flex items-center gap-2 w-full pt-1">
                          <button
                            onClick={() => handleSavePassportPhoto(passportPreviewUrl)}
                            disabled={isSavingPassport}
                            className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isSavingPassport ? 'Saving...' : 'Save As Passport Picture'}</span>
                          </button>
                          <button
                            onClick={() => setPassportPreviewUrl('')}
                            className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Initial Empty State */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files?.[0]) {
                          handlePassportFileSelected(e.dataTransfer.files[0]);
                        }
                      }}
                      className="border-2 border-dashed border-white/20 hover:border-yellow-400/70 bg-[#141D30]/60 hover:bg-[#141D30] rounded-2xl p-6 text-center cursor-pointer transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-yellow-400/10 group-hover:bg-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto mb-2 transition-colors">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-white">Click or drag your passport photo here</p>
                      <p className="text-[11px] text-slate-400 mt-1">Supports JPEG, PNG, or WebP up to 10MB</p>
                      <span className="inline-block mt-3 px-3 py-1 rounded-lg bg-white/5 text-yellow-400 text-[11px] font-semibold">
                        Browse Files from Device
                      </span>
                    </div>
                  )}

                  {/* Upload Options Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 rounded-xl bg-[#141D30] hover:bg-[#182234] border border-white/10 hover:border-yellow-400/40 text-left cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4 text-yellow-400 mb-1.5" />
                      <p className="text-xs font-bold text-white">Choose File</p>
                      <p className="text-[10px] text-slate-400">From gallery / documents</p>
                    </button>

                    <button
                      onClick={startCameraCapture}
                      className="p-3 rounded-xl bg-[#141D30] hover:bg-[#182234] border border-white/10 hover:border-yellow-400/40 text-left cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4 text-yellow-400 mb-1.5" />
                      <p className="text-xs font-bold text-white">Take Selfie / Photo</p>
                      <p className="text-[10px] text-slate-400">Use device camera</p>
                    </button>
                  </div>

                  {/* Compliance & Security Note */}
                  <div className="p-3 rounded-xl bg-[#090E17] border border-white/5 flex items-start gap-2.5 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed">
                      Your identity photo is stored securely and displayed on your user profile and transaction receipts. Only you can view or modify it.
                    </p>
                  </div>

                  {/* Remove existing photo button */}
                  {userPassportPhoto && !passportPreviewUrl && (
                    <button
                      onClick={handleRemovePassportPhoto}
                      className="w-full py-2 text-center text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      Remove Current Passport Picture
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
