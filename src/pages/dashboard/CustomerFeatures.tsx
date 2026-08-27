import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PassportPhotoUploader } from '../../components/common/PassportPhotoUploader';
import {
  Camera,
  CheckCircle2,
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Smartphone,
  Laptop,
  AlertTriangle,
  Send,
  User,
  MapPin,
  Mail,
  Phone,
  Lock,
  RefreshCw,
  Clock,
  Eye,
  Fingerprint,
  Scan,
  Sun,
  Moon,
  Key,
  Shield,
  Check,
  Sparkles,
  Award,
  Copy,
  ExternalLink,
  QrCode,
  Globe,
  Building,
  FileCheck,
  Cpu,
  Layers,
  Zap,
  CreditCard,
  X,
  Upload,
  UserCheck,
  BadgeCheck
} from 'lucide-react';

export const DepositCheckPage: React.FC = () => {
  const { accounts, executeTransfer, showToast } = useBank();

  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [amountStr, setAmountStr] = useState('7500.00');
  const [checkNumber, setCheckNumber] = useState('4921');
  const [payerName, setPayerName] = useState('Wellington Asset Management LLC');
  const [frontCaptured, setFrontCaptured] = useState(true);
  const [backCaptured, setBackCaptured] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState<any>(null);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountMinor = Math.round(parseFloat(amountStr || '0') * 100);

    if (amountMinor <= 0) {
      showToast('ERROR', 'Invalid Amount', 'Please specify a check amount greater than zero.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setDepositSuccess({
        referenceNumber: `CHK-${Math.random().toString().slice(2, 8)}`,
        amount: amountMinor,
        message: 'Check deposited and endorsed. Funds clearing scheduled according to Regulation CC.'
      });
      showToast('SUCCESS', 'Check Clearing Initiated', `$${(amountMinor / 100).toLocaleString()} credited subject to clearing.`);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-2 transition-colors">
        <h1 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
          Mobile &amp; Remote Check Capture
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Instant digital clearing with automated optical MICR character recognition and funds availability rules.
        </p>
      </div>

      {depositSuccess ? (
        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-8 border border-emerald-200 dark:border-emerald-800/60 shadow-md text-center space-y-5 transition-colors">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Check Endorsed &amp; Accepted</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">{depositSuccess.message}</p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-900/80 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-700 dark:text-slate-300 font-mono text-left">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-sans">Immediate Availability:</span>
              <span className="font-bold font-sans text-emerald-600 dark:text-emerald-400">$500.00 (Instant)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-sans">Full Ledger Release:</span>
              <span className="font-bold font-sans text-slate-900 dark:text-slate-200">Next Business Day 9:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-sans">Reference:</span>
              <span className="font-bold text-[#c5a880]">{depositSuccess.referenceNumber}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setDepositSuccess(null);
              setAmountStr('');
            }}
            className="px-6 py-2.5 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-white font-bold text-xs uppercase cursor-pointer border border-[#c5a880]/30 hover:bg-[#15345d]"
          >
            Deposit Another Check
          </button>
        </div>
      ) : (
        <form onSubmit={handleDeposit} className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-6 transition-colors">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Deposit Into Account
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) — Available: ${(acc.availableBalanceMinor / 100).toLocaleString()} {acc.currency}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Check Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Check Serial #
              </label>
              <input
                type="text"
                required
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Check Issuer / Payer
            </label>
            <input
              type="text"
              required
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          {/* Simulated Image Capture Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => {
                setFrontCaptured(true);
                showToast('SUCCESS', 'Front Check Captured', 'High-resolution MICR band validated.');
              }}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                frontCaptured 
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300' 
                  : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Camera className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {frontCaptured ? '✓ Front Image Captured' : 'Capture Check Front'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Tap to simulate optical camera scan</span>
            </div>

            <div
              onClick={() => {
                setBackCaptured(true);
                showToast('SUCCESS', 'Back Check Captured', 'Endorsement signature recognized.');
              }}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                backCaptured 
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300' 
                  : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Camera className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {backCaptured ? '✓ Back Image Endorsed' : 'Capture Check Back'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Requires endorsement signature</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#132d52] dark:hover:bg-[#183d6a] text-white font-bold text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#c5a880]/30 transition-all"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" /> : <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />}
            <span>Submit Check for Instant Clearing</span>
          </button>
        </form>
      )}
    </div>
  );
};

export const StatementsPage: React.FC = () => {
  const { accounts, recentTransactions, currentUser, showToast } = useBank();
  const [selectedStatement, setSelectedStatement] = useState<any>(null);

  const statements = [
    { period: 'August 2026', date: 'Aug 31, 2026', size: '245 KB', startBal: 12500000, endBal: 14892050 },
    { period: 'July 2026', date: 'Jul 31, 2026', size: '312 KB', startBal: 9800000, endBal: 12500000 },
    { period: 'June 2026', date: 'Jun 30, 2026', size: '289 KB', startBal: 8200000, endBal: 9800000 },
    { period: 'May 2026', date: 'May 31, 2026', size: '304 KB', startBal: 7500000, endBal: 8200000 },
    { period: 'April 2026', date: 'Apr 30, 2026', size: '260 KB', startBal: 6900000, endBal: 7500000 },
    { period: 'March 2026', date: 'Mar 31, 2026', size: '275 KB', startBal: 5400000, endBal: 6900000 }
  ];

  const handleDownload = (period: string, format: string) => {
    showToast(
      'SUCCESS',
      `Official Statement Downloaded`,
      `Verified monthly statement for ${period} generated in ${format} format with cryptographic seal.`
    );
  };

  const primaryAccount = accounts[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Electronic Statements &amp; Tax Documents
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official monthly account transcripts, 1099-INT dividend summaries, and audit confirmations.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Current Page</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#0a192f] rounded-2xl border border-slate-200 dark:border-[#1e3656] shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden transition-colors">
        {statements.map((stmt) => (
          <div key={stmt.period} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center shrink-0 border border-[#c5a880]/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{stmt.period} Monthly Statement</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Issued: {stmt.date} • {stmt.size} • Cryptographically Signed</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedStatement(stmt)}
                className="px-3.5 py-1.5 rounded-lg border border-[#0a192f] dark:border-[#c5a880] text-[#0a192f] dark:text-[#e5ca95] hover:bg-[#0a192f] hover:text-white dark:hover:bg-[#c5a880] dark:hover:text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
              <button
                onClick={() => handleDownload(stmt.period, 'PDF')}
                className="px-3.5 py-1.5 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#132d52] dark:hover:bg-[#183d6a] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-[#c5a880]/30"
              >
                <Download className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleDownload(stmt.period, 'CSV')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                CSV
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Statement Preview Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-300 dark:border-[#1e3656] space-y-6 text-slate-900 dark:text-slate-100">
            {/* Statement Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center font-serif font-bold text-sm border border-[#c5a880]/40">
                    FAB
                  </div>
                  <span className="font-serif font-bold text-lg text-slate-900 dark:text-white">First Atlantic Bank &amp; Trust</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">Institutional Private Wealth &amp; Commercial Banking</p>
              </div>

              <div className="text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                <div className="font-bold text-slate-900 dark:text-white uppercase">Official Account Statement</div>
                <div>Period: {selectedStatement.period}</div>
                <div>Statement Date: {selectedStatement.date}</div>
              </div>
            </div>

            {/* Client & Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-slate-400 uppercase text-[10px]">Account Holder</div>
                <div className="font-bold text-slate-900 dark:text-white font-sans text-sm">{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Jonathan Sterling'}</div>
                <div className="text-slate-600 dark:text-slate-400">CIF: {currentUser?.id || 'FAB-99201948'}</div>
              </div>
              <div className="sm:text-right">
                <div className="text-slate-400 uppercase text-[10px]">Primary Account</div>
                <div className="font-bold text-slate-900 dark:text-white font-sans text-sm">{primaryAccount?.name || 'Private Wealth Checking'}</div>
                <div className="text-slate-600 dark:text-slate-400">Acct #{primaryAccount?.accountNumber || '•••• 8819'} • Routing: 021000021</div>
              </div>
            </div>

            {/* Balance Summary */}
            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Starting Balance</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">${(selectedStatement.startBal / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Net Activity</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+${((selectedStatement.endBal - selectedStatement.startBal) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Closing Balance</div>
                <div className="text-sm font-bold text-[#8c6d37] dark:text-[#c5a880]">${(selectedStatement.endBal / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* Transactions itemization */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-serif">Transaction Itemization</h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Channel</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 text-slate-500 dark:text-slate-400">{new Date(tx.createdTimestamp).toLocaleDateString()}</td>
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 font-sans font-medium">{tx.description}</td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[10px]">{tx.channel}</td>
                        <td className={`p-2.5 text-right font-bold ${tx.direction === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                          {tx.direction === 'CREDIT' ? '+' : '-'}${((tx.amountMinor || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Security seal and dismissal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Cryptographic Digest: SHA256-7f8a91b2c3d4e5f6... (Official Transcript)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedStatement(null)}
                  className="px-5 py-2 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#132d52] text-white font-bold text-xs cursor-pointer border border-[#c5a880]/30"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SecurityCenterPage: React.FC = () => {
  const {
    showToast,
    biometricState,
    toggleBiometrics,
    updateBiometricSettings,
    openBiometricPrompt,
    darkMode
  } = useBank();

  const handleRevoke = (device: string) => {
    showToast('SUCCESS', 'Session Terminated', `Device session for ${device} has been revoked.`);
  };

  const handleToggleLoginBiometrics = async () => {
    if (!biometricState.enabled) {
      // If biometrics isn't enabled at all, prompt enrollment first
      const result = await toggleBiometrics(true);
      if (result.success) {
        updateBiometricSettings({ requireForLogin: true });
      }
    } else {
      const nextVal = !biometricState.requireForLogin;
      updateBiometricSettings({ requireForLogin: nextVal });
      showToast(
        'SUCCESS',
        nextVal ? 'Biometric Quick Login Enabled' : 'Biometric Quick Login Disabled',
        nextVal
          ? 'FaceID / Fingerprint will now be accepted for 1-tap sign in.'
          : 'Standard PIN & Password required on next sign in.'
      );
    }
  };

  const handleToggleWireBiometrics = () => {
    const nextVal = !biometricState.requireForWires;
    updateBiometricSettings({ requireForWires: nextVal });
    showToast(
      'INFO',
      'Transfer Policy Updated',
      nextVal ? 'Biometric sensor required for outgoing wires.' : 'Biometric wire check relaxed.'
    );
  };

  const handleToggleCardBiometrics = () => {
    const nextVal = !biometricState.requireForCardUnfreeze;
    updateBiometricSettings({ requireForCardUnfreeze: nextVal });
    showToast(
      'INFO',
      'Card Security Updated',
      nextVal ? 'Biometric confirmation required to unfreeze cards.' : 'Biometric card check relaxed.'
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Security Governance &amp; Threat Defense
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your cryptographic credentials, biometric hardware tokens, and authorized devices.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Security Score: {biometricState.enabled ? '98 / 100 (Maximum Defense)' : '88 / 100 (Protected)'}</span>
        </div>
      </div>

      {/* Primary Biometric Hardware Token Banner */}
      <div className="bg-gradient-to-r from-[#071322] via-[#0d233e] to-[#0a192f] text-white rounded-2xl p-6 border border-[#c5a880]/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              biometricState.enabled 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                : 'bg-[#c5a880]/20 text-[#c5a880] border-[#c5a880]/40'
            }`}>
              <Fingerprint className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif text-[#e5ca95]">
                  Mobile &amp; Hardware Biometric Enclave
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  biometricState.enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {biometricState.enabled ? 'BOUND & ACTIVE' : 'NOT ENROLLED'}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Secure your transactions and account sessions with on-device Apple Secure Enclave / Windows Hello biometric verification (W3C WebAuthn Level 2).
              </p>
              {biometricState.enabled && (
                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                  <span>Device: {biometricState.deviceName}</span>
                  <span>•</span>
                  <span>Enrolled: {biometricState.enrolledAt ? new Date(biometricState.enrolledAt).toLocaleDateString() : 'Active'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {biometricState.enabled ? (
              <>
                <button
                  onClick={() => openBiometricPrompt({ mode: 'VERIFY', title: 'Test Biometric Sensor', subtitle: 'Simulate instant Touch ID / Face ID sensor scan.' })}
                  className="px-4 py-2.5 rounded-xl bg-[#c5a880] text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:brightness-105 transition-all cursor-pointer shadow-md"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Test Sensor</span>
                </button>
                <button
                  onClick={() => toggleBiometrics(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Unbind Key
                </button>
              </>
            ) : (
              <button
                onClick={() => toggleBiometrics(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-105 transition-all cursor-pointer shadow-lg"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Enroll Biometric Key</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dedicated Biometric Quick Login & Access Controls */}
      <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
              Biometric Access Policy &amp; Quick Login Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize which security touchpoints accept FaceID, Touch ID, or Hardware Fingerprint scan.
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#8c6d37] dark:text-[#c5a880] bg-[#c5a880]/10 px-2.5 py-1 rounded-lg border border-[#c5a880]/30">
            FIDO2 / WebAuthn Level 2
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {/* Quick Login Toggle */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-[#8c6d37] dark:text-[#c5a880]" />
                <span>Quick Biometric Login Access (FaceID / Fingerprint)</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Allow 1-tap passkey biometric login on this device without typing your password each session.
              </p>
            </div>

            <button
              onClick={handleToggleLoginBiometrics}
              type="button"
              role="switch"
              aria-checked={biometricState.enabled && biometricState.requireForLogin}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                biometricState.enabled && biometricState.requireForLogin
                  ? 'bg-emerald-500'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  biometricState.enabled && biometricState.requireForLogin ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Wire Pre-authorization Toggle */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Biometric Wire Transfer Pre-Authorization</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Require a live biometric scan to release high-value Fedwire, SWIFT, and CHAPS disbursements.
              </p>
            </div>

            <button
              onClick={handleToggleWireBiometrics}
              type="button"
              role="switch"
              aria-checked={biometricState.requireForWires}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                biometricState.requireForWires
                  ? 'bg-emerald-500'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  biometricState.requireForWires ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Card Unfreeze Toggle */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Biometric Titanium Card Unfreeze Confirmation</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Require biometric authentication before unlocking or adjusting limits on Atlantic Infinite cards.
              </p>
            </div>

            <button
              onClick={handleToggleCardBiometrics}
              type="button"
              role="switch"
              aria-checked={biometricState.requireForCardUnfreeze}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                biometricState.requireForCardUnfreeze
                  ? 'bg-emerald-500'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  biometricState.requireForCardUnfreeze ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Active Authorized Devices */}
        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 transition-colors">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-serif">
            Active Registered Sessions
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">MacBook Pro (Safari 18.2)</h4>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">This Current Session • New York, USA</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">Active</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">iPhone 16 Pro (FAB Mobile App)</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Last active 3 hours ago • Boston, USA</p>
                </div>
              </div>
              <button
                onClick={() => handleRevoke('iPhone 16 Pro')}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>

        {/* Right: Security Settings & Alerts */}
        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 transition-colors">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-serif">
            MFA &amp; Fraud Monitoring
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication (MFA)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Hardware TOTP &amp; SMS verification</div>
              </div>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Enabled</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Passkey / Biometric Auth</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">FIDO2 WebAuthn TouchID/FaceID</div>
              </div>
              <span className={`font-bold ${biometricState.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                {biometricState.enabled ? 'Enrolled' : 'Available'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Large Wire SMS Pre-Authorization</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Mandatory for transfers &gt; $10,000</div>
              </div>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Enforced</span>
            </div>
          </div>

          <button
            onClick={() => showToast('INFO', 'Suspicious Activity Report', 'Security incident report opened. Fraud ops dispatched.')}
            className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Report Suspicious Activity</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MessagesPage: React.FC = () => {
  const { currentUser, showToast } = useBank();
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Alistair Vance (Senior VP, Private Wealth)',
      timestamp: 'Today at 09:14 AM',
      body: `Good morning ${currentUser?.firstName || 'Mr. Sterling'}. Your quarterly transatlantic treasury summary and fixed income allocation updates have been finalized. Please let me know if you would like to schedule a private advisory call this Thursday.`,
      isStaff: true
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: String(Date.now()),
      sender: `${currentUser?.firstName} ${currentUser?.lastName}`,
      timestamp: 'Just now',
      body: inputText,
      isStaff: false
    };

    setMessages([...messages, newMsg]);
    setInputText('');
    showToast('SUCCESS', 'Encrypted Message Dispatched', 'Your relationship manager has been notified.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-2 transition-colors">
        <h1 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
          Encrypted Private Wealth Concierge
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          End-to-end encrypted direct communication channel with your assigned senior private banking officer.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0a192f] rounded-2xl border border-slate-200 dark:border-[#1e3656] shadow-sm overflow-hidden flex flex-col h-[520px] transition-colors">
        {/* Messages list */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.isStaff ? 'items-start' : 'items-end'}`}
            >
              <div className="text-[10px] text-slate-400 font-mono mb-1">
                {m.sender} • {m.timestamp}
              </div>
              <div
                className={`max-w-lg p-4 rounded-2xl text-xs leading-relaxed ${
                  m.isStaff
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800'
                    : 'bg-[#0a192f] dark:bg-[#112a4a] text-white rounded-tr-none shadow-sm border border-[#c5a880]/30'
                }`}
              >
                {m.body}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex gap-3">
          <input
            type="text"
            placeholder="Type encrypted message to private banker..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#8c6d37]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#132d52] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-[#c5a880]/30"
          >
            <Send className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const { 
    currentUser, 
    showToast, 
    region, 
    darkMode, 
    setDarkMode, 
    toggleDarkMode,
    biometricState,
    toggleBiometrics,
    updateBiometricSettings,
    openBiometricPrompt,
    accounts,
    updatePassportDetails,
    updateLoginPin,
    updateCurrentCustomerProfile
  } = useBank();

  const [activeTab, setActiveTab] = useState<'personal' | 'routing' | 'security' | 'preferences'>('personal');
  const [firstName, setFirstName] = useState(currentUser?.firstName || 'Jonathan');
  const [lastName, setLastName] = useState(currentUser?.lastName || 'Sterling');
  const [email, setEmail] = useState(currentUser?.email || 'sterling.private@firstatlantic.com');
  const [phone, setPhone] = useState(currentUser?.phone || '(212) 849-2000');
  const [address, setAddress] = useState(currentUser?.address || '740 Park Avenue, Apt 14B, New York, NY 10021');
  
  // Passport Identity Details
  const [passportPhoto, setPassportPhoto] = useState(currentUser?.passportPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
  const [passportNumber, setPassportNumber] = useState(currentUser?.passportNumber || 'P98420193');
  const [nationality, setNationality] = useState(currentUser?.nationality || 'United States');
  const [isSavingPassport, setIsSavingPassport] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);

  // Security PIN states
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showDirectDepositModal, setShowDirectDepositModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Preference switches
  const [paperlessEnrolled, setPaperlessEnrolled] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [fraudShieldEnabled, setFraudShieldEnabled] = useState(true);

  // Account Type Selection Preference (Savings, Checking, Investment)
  const [selectedAccountType, setSelectedAccountType] = useState<'Savings' | 'Checking' | 'Investment'>(() => {
    return (localStorage.getItem('user_profile_account_type') as any) || 'Checking';
  });
  const [isSavingAccountType, setIsSavingAccountType] = useState(false);

  // Sync state if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.firstName) setFirstName(currentUser.firstName);
      if (currentUser.lastName) setLastName(currentUser.lastName);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.address) setAddress(currentUser.address);
      if (currentUser.passportPhoto) setPassportPhoto(currentUser.passportPhoto);
      if (currentUser.passportNumber) setPassportNumber(currentUser.passportNumber);
      if (currentUser.nationality) setNationality(currentUser.nationality);
    }
  }, [currentUser]);

  const handleSaveAccountType = (newType: 'Savings' | 'Checking' | 'Investment') => {
    setSelectedAccountType(newType);
    localStorage.setItem('user_profile_account_type', newType);
    showToast('SUCCESS', 'Account Type Updated', `Your profile default account has been set to ${newType}.`);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    showToast('SUCCESS', 'Copied to Clipboard', `${label} copied: ${text}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const res = await updateCurrentCustomerProfile({
      firstName,
      lastName,
      email,
      phone,
      address
    });
    setIsSavingProfile(false);
  };

  const handleSavePassport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassport(true);
    const res = await updatePassportDetails({
      passportPhoto,
      passportNumber,
      nationality
    });
    setIsSavingPassport(false);
    if (res.success) {
      setShowPassportModal(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPin || currentPin.length !== 4) {
      showToast('ERROR', 'PIN Error', 'Please enter your current 4-digit PIN.');
      return;
    }
    if (newPin.length !== 4) {
      showToast('ERROR', 'Invalid PIN', 'New PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('ERROR', 'Mismatch', 'New PIN and confirmation do not match.');
      return;
    }
    setIsUpdatingPin(true);
    const res = await updateLoginPin(currentPin, newPin);
    setIsUpdatingPin(false);
    if (res.success) {
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    }
  };

  const primaryAccount = accounts.find(a => a.type === 'CHECKING_PREMIER') || accounts[0];
  const totalVaultBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-boa">
      {/* 1. Bank of America Signature Profile Header Banner */}
      <div className="bg-[#012169] text-white rounded-lg shadow-sm border border-[#00174a] overflow-hidden">
        {/* Top Red Heritage Stripe */}
        <div className="h-1 bg-[#d4001a] w-full" />
        
        <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Interactive Avatar with Passport Quick Upload */}
            <div className="relative group shrink-0">
              <div 
                onClick={() => setShowPassportModal(true)}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-white/80 bg-slate-900 shadow-md cursor-pointer relative hover:opacity-95 transition-opacity"
                title="Click to change or upload passport photo"
              >
                <img
                  src={passportPhoto || currentUser?.passportPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                  alt="Profile photo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <Camera className="w-4 h-4 text-white drop-shadow-xs" />
                  <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5">Edit</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPassportModal(true)}
                className="absolute -bottom-1.5 -right-1.5 p-1 bg-[#d4001a] hover:bg-[#b30016] text-white rounded-full shadow-md border-2 border-[#012169] cursor-pointer transition-colors"
                title="Upload/Take Passport Photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded text-white border border-white/20">
                  {currentUser?.kycTier ? String(currentUser.kycTier).replace(/_/g, ' ') : 'Preferred Rewards Member'}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-300 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  <ShieldCheck className="w-3 h-3" /> FDIC Insured
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassportModal(true)}
                  className="text-[10px] sm:text-[11px] font-medium text-amber-200 hover:text-white underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Upload className="w-2.5 h-2.5" />
                  Change Passport Photo
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {currentUser?.firstName || firstName} {currentUser?.lastName || lastName}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-200">
                <span>Online ID: <strong className="text-white font-mono">{currentUser?.username || 'jsterling'}</strong></span>
                <span>•</span>
                <span>Customer Since: <strong className="text-white">2018</strong></span>
                <span>•</span>
                <span>Bank: <strong className="text-white">First Atlantic Bank</strong></span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
            <button
              onClick={() => setShowPassportModal(true)}
              className="px-3 py-1.5 rounded bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Update Photo</span>
            </button>

            <button
              onClick={() => setShowDirectDepositModal(true)}
              className="px-3 py-1.5 rounded bg-[#d4001a] hover:bg-[#b30016] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Direct Deposit</span>
            </button>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-[#012169] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-[#012169]" />
              <span>Standing</span>
            </button>
          </div>
        </div>

        {/* Bank of America Tab Bar */}
        <div className="bg-[#00174a] px-4 sm:px-6 border-t border-white/10 flex overflow-x-auto gap-1 text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-2.5 px-3 sm:px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'personal'
                ? 'border-[#d4001a] text-white font-bold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Personal &amp; Contact Info
          </button>

          <button
            onClick={() => setActiveTab('routing')}
            className={`py-2.5 px-3 sm:px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'routing'
                ? 'border-[#d4001a] text-white font-bold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Routing &amp; Direct Deposit
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-2.5 px-3 sm:px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-[#d4001a] text-white font-bold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Security &amp; Biometrics
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-2.5 px-3 sm:px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'border-[#d4001a] text-white font-bold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Paperless &amp; Alerts
          </button>
        </div>
      </div>

      {/* 2. TAB: Personal & Contact Information */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          {/* PROFILE ACCOUNT TYPE SELECTION DROPDOWN */}
          <div className="boa-card p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#012169] text-white flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="boa-title-md">Profile Account Type &amp; Operating Ledger</h2>
                  <p className="boa-caption mt-0.5">
                    Select your primary operating account type for profile services, direct debits, and dashboard clearing.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-[#012169] dark:text-blue-300 border border-blue-300 dark:border-blue-800 self-start sm:self-auto">
                Current: {selectedAccountType}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              <div className="md:col-span-6 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5 font-sans">
                    Choose Primary Account Type *
                  </label>
                  <select
                    value={selectedAccountType}
                    onChange={(e) => handleSaveAccountType(e.target.value as 'Savings' | 'Checking' | 'Investment')}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#012169] dark:focus:border-blue-500 shadow-xs cursor-pointer"
                  >
                    <option value="Checking">Checking — Premier Wealth Checking (Direct Deposit &amp; Everyday Spending)</option>
                    <option value="Savings">Savings — Sovereign High-Yield Vault (4.85% APY &amp; Cash Reserves)</option>
                    <option value="Investment">Investment — Global Capital Markets &amp; Wealth Portfolio</option>
                  </select>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Your profile defaults and transaction routing will prioritize this account type.
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSaveAccountType(selectedAccountType)}
                    className="boa-btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply {selectedAccountType} Account Preference</span>
                  </button>
                </div>
              </div>

              {/* Account Type Details Showcase Card */}
              <div className="md:col-span-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {selectedAccountType === 'Savings' && 'High-Yield Savings Specifications'}
                    {selectedAccountType === 'Checking' && 'Premier Checking Specifications'}
                    {selectedAccountType === 'Investment' && 'Wealth Investment Specifications'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Active on Profile
                  </span>
                </div>

                {selectedAccountType === 'Savings' && (
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span>Annual Percentage Yield (APY):</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">4.85% Compound Daily</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span>Monthly Fee:</span>
                      <span className="font-bold text-slate-900 dark:text-white">$0.00 (Waived for Tier 3 KYC)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Insurance &amp; Backing:</span>
                      <span className="font-bold text-slate-900 dark:text-white">FDIC Insured up to $5,000,000</span>
                    </div>
                  </div>
                )}

                {selectedAccountType === 'Checking' && (
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span>Direct Deposit &amp; Clearing:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Same-Day Priority Credit</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span>Domestic &amp; Wire Fees:</span>
                      <span className="font-bold text-slate-900 dark:text-white">$0.00 Unlimited Free Wires</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Overdraft Protection:</span>
                      <span className="font-bold text-slate-900 dark:text-white">Linked to Sovereign Vault</span>
                    </div>
                  </div>
                )}

                {selectedAccountType === 'Investment' && (
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span>Asset Allocation Desk:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">Global Equities, Bonds &amp; FX</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span>Custody Protection:</span>
                      <span className="font-bold text-slate-900 dark:text-white">SIPC Protected up to $50,000,000</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Dedicated Advisor:</span>
                      <span className="font-bold text-slate-900 dark:text-white">Lord Alistair Sterling (Desk 4901)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PASSPORT & BIOMETRIC IDENTITY SECTION */}
          <div className="boa-card p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#012169] text-white flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="boa-title-md">Passport &amp; Official Photo Identification</h2>
                  <p className="boa-caption mt-0.5">
                    Your verified sovereign passport photograph and identity record on file with First Atlantic &amp; Bank of America.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 self-start sm:self-auto">
                Biometrics Active
              </span>
            </div>

            <form onSubmit={handleSavePassport} className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Passport Photo Uploader Column */}
                <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                    Profile / Passport Photo
                  </label>
                  <PassportPhotoUploader
                    currentPhoto={passportPhoto}
                    onPhotoChange={(url) => {
                      setPassportPhoto(url);
                      showToast('SUCCESS', 'Photo Selected', 'New photo ready to save. Click "Save Passport & Photo" below.');
                    }}
                    title="Upload or Change Passport Photo"
                    description="Upload your picture or take a live photo using your camera to update your profile."
                  />
                </div>

                {/* Passport Number & Nationality Column */}
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Passport / Sovereign Document Number
                    </label>
                    <input
                      type="text"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      placeholder="e.g. P98420193"
                      className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#012169]"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Must match the document on file with compliance &amp; KYC verification.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Issuing Country / Nationality
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. United States"
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#012169]"
                    />
                  </div>

                  {/* Verification Badges */}
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md space-y-2 text-xs text-blue-900 dark:text-blue-200">
                    <div className="flex items-center gap-2 font-semibold text-[#012169] dark:text-blue-300">
                      <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      <span>Sovereign Identity Protection</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Your passport photograph and document number are encrypted via AES-256 and matched against our biometrics vault for wire transfers and large transactions.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingPassport}
                      className="boa-btn-red text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingPassport ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>{isSavingPassport ? 'Saving Passport...' : 'Save Passport & Photo'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* CONTACT & RESIDENTIAL ADDRESS FORM */}
          <form onSubmit={handleSaveContact} className="boa-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="boa-title-md">Personal Information &amp; Primary Identification</h2>
                <p className="boa-caption mt-0.5">
                  Keep your personal contact details current to ensure you receive essential security alerts and account notices.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                KYC Level 3 Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Legal First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#012169]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Legal Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#012169]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Email Address (Security Alerts)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#012169]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Mobile Phone (SMS 2-Step Verification)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#012169]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Residential &amp; Mailing Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#012169]"
              />
            </div>

            {/* Readonly Identity Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Tax Identification (SSN / TIN)</span>
                <span className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100">***-**-8492</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">W-9 Certified On File</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Passport / Sovereign Doc</span>
                <span className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100">{passportNumber || currentUser?.passportNumber || 'P98420193'}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Nationality: {nationality || currentUser?.nationality || 'United States'}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Relationship Officer</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Lord Alistair Sterling</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Private Wealth Desk: ext. 4901</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="boa-btn-primary cursor-pointer shadow-xs text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSavingProfile && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSavingProfile ? 'Saving...' : 'Save Contact Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUICK PASSPORT MODAL */}
      {showPassportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0d1b30] w-full max-w-lg rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-[#012169] text-white flex items-center justify-between border-b border-[#00174a]">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold text-white">Update Passport &amp; Profile Picture</h3>
              </div>
              <button
                onClick={() => setShowPassportModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <PassportPhotoUploader
                currentPhoto={passportPhoto}
                onPhotoChange={(url) => setPassportPhoto(url)}
                title="Select or Capture Photo"
                description="Upload an image from your device or use your camera."
              />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPassportModal(false)}
                className="boa-btn-secondary text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePassport}
                disabled={isSavingPassport}
                className="boa-btn-primary text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSavingPassport && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSavingPassport ? 'Saving...' : 'Apply Photo to Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: Routing & Direct Deposit */}
      {activeTab === 'routing' && (
        <div className="space-y-6">
          <div className="boa-card p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="boa-title-md">Direct Deposit &amp; Bank Routing Information</h2>
                <p className="boa-caption mt-0.5">
                  Use these numbers to set up electronic direct deposit of payroll, pensions, tax refunds, or domestic and international wire transfers.
                </p>
              </div>

              <button
                onClick={() => setShowDirectDepositModal(true)}
                className="boa-btn-red cursor-pointer flex items-center gap-1.5 text-xs self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Pre-Filled Direct Deposit Form (PDF)</span>
              </button>
            </div>

            {/* Bank of America Official Table Style */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-md">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Transfer / Clearing Type</th>
                    <th className="py-3 px-4">Routing / Code</th>
                    <th className="py-3 px-4">Bank Name &amp; Address</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div>Paper &amp; Electronic (ACH)</div>
                      <span className="text-xs text-slate-500 font-normal">Direct Deposit, Payroll &amp; Bill Pay</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sm text-[#012169] dark:text-[#93c5fd]">
                      021000089
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      First Atlantic Bank &amp; Trust, N.A. (100 Wall St, New York, NY)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleCopy('021000089', 'ACH Routing')}
                        className="px-3 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        {copiedCode === 'ACH Routing' ? 'Copied' : 'Copy'}
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div>Domestic Wire Transfers (Fedwire)</div>
                      <span className="text-xs text-slate-500 font-normal">Same-day incoming bank wire transfer</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sm text-[#012169] dark:text-[#93c5fd]">
                      021000089
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      Federal Reserve Bank of New York (Fedwire Clearing Member)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleCopy('021000089', 'Fedwire Routing')}
                        className="px-3 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        {copiedCode === 'Fedwire Routing' ? 'Copied' : 'Copy'}
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div>United Kingdom Sort Code (CHAPS / Faster Payments)</div>
                      <span className="text-xs text-slate-500 font-normal">Direct BACS / Faster Payments settlement</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sm text-[#012169] dark:text-[#93c5fd]">
                      40-05-18
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      Bank of England Clearing, 1 Canada Square, London E14 5AA
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleCopy('400518', 'UK Sort Code')}
                        className="px-3 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        {copiedCode === 'UK Sort Code' ? 'Copied' : 'Copy'}
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div>International SWIFT / BIC</div>
                      <span className="text-xs text-slate-500 font-normal">Cross-border foreign wire settlement</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sm text-[#012169] dark:text-[#93c5fd]">
                      FABKUS33
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      SWIFT Interbank Messaging System
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleCopy('FABKUS33', 'SWIFT BIC')}
                        className="px-3 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        {copiedCode === 'SWIFT BIC' ? 'Copied' : 'Copy'}
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div>International IBAN Number</div>
                      <span className="text-xs text-slate-500 font-normal">Multi-Currency Global Vault Account</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-xs text-[#012169] dark:text-[#93c5fd]">
                      GB29FABK40051888492019
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      First Atlantic London Custody
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleCopy('GB29FABK40051888492019', 'IBAN')}
                        className="px-3 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        {copiedCode === 'IBAN' ? 'Copied' : 'Copy'}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note & Direct Deposit Instructions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Employer &amp; Payroll Authorization Notice</span>
              </div>
              <p>
                When providing your account details to an employer or payroll provider, provide your full legal name, account number <strong>{primaryAccount?.accountNumber || '•••• 8819'}</strong>, and routing number <strong>021000089</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: Security & Biometrics */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Biometrics & FIDO2 Card */}
          <div className="boa-card p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-[#012169] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="boa-title-md">Touch ID / Face ID &amp; Biometric Sign-In</h2>
                  <p className="boa-caption mt-0.5">
                    Enable Apple Touch ID, Face ID, or Windows Hello for instant, passwordless sign-in and wire transaction approvals.
                  </p>
                </div>
              </div>

              {/* Hardware Switch */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {biometricState.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={biometricState.enabled}
                  onClick={() => toggleBiometrics()}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative ${
                    biometricState.enabled ? 'bg-[#012169]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      biometricState.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Biometric Configuration Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-start gap-2.5 p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometricState.requireForLogin}
                  onChange={(e) => updateBiometricSettings({ requireForLogin: e.target.checked })}
                  disabled={!biometricState.enabled}
                  className="mt-0.5 rounded text-[#012169] focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">Sign-In Biometrics</span>
                  <span className="text-[11px] text-slate-500">Require fingerprint/face scan upon login</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometricState.requireForWires}
                  onChange={(e) => updateBiometricSettings({ requireForWires: e.target.checked })}
                  disabled={!biometricState.enabled}
                  className="mt-0.5 rounded text-[#012169] focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">Wire Transfer Authorization</span>
                  <span className="text-[11px] text-slate-500">Biometric sign-off for transfers &gt; $5,000</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometricState.requireForCardUnfreeze}
                  onChange={(e) => updateBiometricSettings({ requireForCardUnfreeze: e.target.checked })}
                  disabled={!biometricState.enabled}
                  className="mt-0.5 rounded text-[#012169] focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">Card Unfreeze Verification</span>
                  <span className="text-[11px] text-slate-500">Require sensor scan before unfreezing debit card</span>
                </div>
              </label>
            </div>

            {biometricState.enabled && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => openBiometricPrompt({ 
                    mode: 'VERIFY', 
                    title: 'Test Native Biometric Hardware Scan', 
                    subtitle: 'Simulating on-device biometric sensor hardware verification.' 
                  })}
                  className="boa-btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Test Biometric Sensor</span>
                </button>
              </div>
            )}
          </div>

          {/* 4-Digit Security PIN Card */}
          <div className="boa-card p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-[#012169] text-white flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="boa-title-md">4-Digit Security PIN &amp; Checkpoint Passkey</h2>
                <p className="boa-caption mt-0.5">
                  Used for wire verification and high-security account adjustments.
                </p>
              </div>
            </div>

            <form
              onSubmit={handlePinSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3 py-2 text-sm font-mono text-center tracking-[0.4em] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#012169]"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Default demo: 1234 or 8492</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3 py-2 text-sm font-mono text-center tracking-[0.4em] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#012169]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3 py-2 text-sm font-mono text-center tracking-[0.4em] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#012169]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isUpdatingPin}
                  className="boa-btn-primary cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isUpdatingPin && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUpdatingPin ? 'Updating PIN...' : 'Update Security PIN'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Sessions & Security Telemetry */}
          <div className="boa-card p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="boa-title-md">Connected Devices &amp; Active Sessions</h2>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                TLS 1.3 Active Encryption
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 font-semibold uppercase block">Current Device</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Apple Silicon / Chrome Browser</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Session ID: sess_8f92a10</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 font-semibold uppercase block">Location &amp; IP</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">New York, NY (194.73.12.82)</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Zero-Trust Telemetry OK</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 font-semibold uppercase block">Inactivity Auto-Lock</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">10 Minutes (Enforced)</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">FIPS 140-2 Level 3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB: Paperless & Alerts Preferences */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="boa-card p-6 sm:p-7 space-y-6">
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="boa-title-md">Paperless Statements &amp; Electronic Delivery</h2>
              <p className="boa-caption mt-0.5">
                Go green and receive statements, notices, and tax forms online. Fast, secure, and available for 7 years.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Paperless Statements (e-Delivery)</div>
                  <div className="text-xs text-slate-500">Receive digital statements for Checking, Savings, and Credit Cards</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaperlessEnrolled(!paperlessEnrolled);
                    showToast('SUCCESS', 'Paperless Setting Updated', paperlessEnrolled ? 'Enrolled in paper statements.' : 'Enrolled in Paperless e-Delivery.');
                  }}
                  className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    paperlessEnrolled 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {paperlessEnrolled ? 'Enrolled (Paperless)' : 'Paper Mail'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Fraud &amp; High-Risk Activity Alerts</div>
                  <div className="text-xs text-slate-500">Instant SMS text and email for unexpected charges or login attempts</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFraudShieldEnabled(!fraudShieldEnabled)}
                  className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    fraudShieldEnabled 
                      ? 'bg-[#012169] text-white' 
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {fraudShieldEnabled ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Dark / Daylight Display Mode</div>
                  <div className="text-xs text-slate-500">Switch between Bank of America daylight white and obsidian night mode</div>
                </div>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="px-4 py-1.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{darkMode ? 'Daylight Light' : 'Obsidian Dark'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Bank of America Pre-Filled Direct Deposit Form Modal */}
      {showDirectDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0d1b30] w-full max-w-2xl rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-[#012169] text-white flex items-center justify-between border-b border-[#00174a]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-white text-[#012169] font-bold flex items-center justify-center text-sm">
                  FAB
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Direct Deposit Enrollment Form</h3>
                  <p className="text-xs text-slate-200">First Atlantic Bank &amp; Trust / Bank of America Partner Rails</p>
                </div>
              </div>
              <button
                onClick={() => setShowDirectDepositModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Form */}
            <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-800 dark:text-slate-200">
              <div className="p-4 border-2 border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900/60 space-y-4">
                <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#d4001a]">Official Banking Document</div>
                  <h4 className="text-lg font-bold text-[#012169] dark:text-white">Authorization for Direct Deposit (ACH Credit)</h4>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase block text-[10px]">Employee / Account Holder:</span>
                    <strong className="text-sm font-semibold">{currentUser?.firstName || 'Jonathan'} {currentUser?.lastName || 'Sterling'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[10px]">Account Number:</span>
                    <strong className="text-sm font-mono">{primaryAccount?.accountNumber || '•••• 8819'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[10px]">Bank Name:</span>
                    <strong>First Atlantic Bank &amp; Trust, N.A.</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[10px]">Routing Transit Number (ABA):</span>
                    <strong className="text-sm font-mono text-[#012169] dark:text-[#93c5fd]">021000089</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[10px]">Account Type:</span>
                    <strong>Checking / Demand Deposit</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[10px]">Direct Deposit Allocation:</span>
                    <strong>100% of Net Pay</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
                  I hereby authorize my employer or payer to deposit funds directly into my designated First Atlantic checking account. This authorization remains in effect until written notification is provided.
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  window.print();
                  showToast('SUCCESS', 'Printing Form', 'Sent direct deposit authorization form to printer.');
                }}
                className="boa-btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Form</span>
              </button>

              <button
                onClick={() => {
                  setShowDirectDepositModal(false);
                  showToast('SUCCESS', 'PDF Downloaded', 'Direct Deposit authorization form saved to downloads.');
                }}
                className="boa-btn-red text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Certificate of Banking Standing Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0d1b30] w-full max-w-2xl rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-[#012169] text-white flex items-center justify-between border-b border-[#00174a]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-white text-[#012169] font-bold flex items-center justify-center text-sm">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Certificate of Banking Standing</h3>
                  <p className="text-xs text-slate-200">First Atlantic Bank &amp; Trust Institutional Custody</p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-800 dark:text-slate-200">
              <div className="p-5 border-2 border-dashed border-[#012169]/30 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900/60 space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4001a]">
                    Official Certification of Account Standing
                  </span>
                  <h4 className="text-xl font-bold text-[#012169] dark:text-white">
                    First Atlantic Bank &amp; Trust (Member FDIC)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Regulated by the Federal Reserve Bank of New York &amp; Financial Conduct Authority
                  </p>
                </div>

                <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 text-justify">
                  This letter confirms that <strong>{currentUser?.firstName || 'Jonathan'} {currentUser?.lastName || 'Sterling'}</strong> has maintained deposit accounts in good and exemplary standing with First Atlantic Bank &amp; Trust. All funds are held in compliant, insured custodial accounts.
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Account ID:</span>
                    <strong className="text-slate-900 dark:text-slate-100">FA-{currentUser?.id ? currentUser.id.slice(-6).toUpperCase() : '849201'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Liquid Balance:</span>
                    <strong className="text-[#012169] dark:text-[#93c5fd]">${totalVaultBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Fedwire / ABA:</span>
                    <strong className="text-slate-900 dark:text-slate-100">021000089</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                  <div>
                    <span>Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#012169] dark:text-white block">Lord Alistair Sterling</span>
                    <span className="text-[10px]">Comptroller of Accounts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  window.print();
                  showToast('SUCCESS', 'Certificate Exported', 'Print voucher sent to printer.');
                }}
                className="boa-btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  showToast('SUCCESS', 'Certificate Saved', 'PDF Certificate saved to downloads.');
                }}
                className="boa-btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Certified PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
