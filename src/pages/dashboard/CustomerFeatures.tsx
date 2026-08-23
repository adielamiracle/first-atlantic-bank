import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
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
  Sparkles
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
  const { showToast, biometricState, toggleBiometrics, openBiometricPrompt, darkMode } = useBank();

  const handleRevoke = (device: string) => {
    showToast('SUCCESS', 'Session Terminated', `Device session for ${device} has been revoked.`);
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
                  <span>Test Biometrics</span>
                </button>
                <button
                  onClick={() => toggleBiometrics(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Disable
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
    openBiometricPrompt
  } = useBank();

  const [firstName, setFirstName] = useState(currentUser?.firstName || 'Jonathan');
  const [lastName, setLastName] = useState(currentUser?.lastName || 'Sterling');
  const [email, setEmail] = useState(currentUser?.email || 'sterling.private@firstatlantic.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+1 (212) 849-2000');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('SUCCESS', 'Profile Updated', 'KYC and communication preferences saved.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Client Profile &amp; Security Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure biometric hardware credentials, interface display themes, and regulatory KYC records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme:</span>
          <button
            onClick={toggleDarkMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              darkMode 
                ? 'bg-[#112a4a] border-[#c5a880] text-[#e5ca95]' 
                : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {darkMode ? <Moon className="w-3.5 h-3.5 text-[#c5a880]" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span>{darkMode ? 'Obsidian Dark' : 'Daylight Light'}</span>
          </button>
        </div>
      </div>

      {/* 1. Biometric Authentication & Hardware Enclave Setting */}
      <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              biometricState.enabled 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}>
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                  Biometric Authentication (Face ID / Touch ID)
                </h3>
                {biometricState.enabled && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    ENROLLED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Simulate mobile-native biometric sensors (Apple Touch ID, Face ID, Windows Hello) via W3C WebAuthn hardware key enclave.
              </p>
            </div>
          </div>

          {/* Interactive Hardware Toggle Switch */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
              {biometricState.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={biometricState.enabled}
              onClick={() => toggleBiometrics()}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer relative shadow-inner ${
                biometricState.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                  biometricState.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {biometricState.enabled ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Biometric Details & Policy Parameters */}
        <div className={`p-4 rounded-xl border text-xs space-y-4 ${
          biometricState.enabled 
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60' 
            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Enclave Hardware:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{biometricState.deviceName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Credential Digest:</span>
              <span className="font-bold text-[#c5a880] truncate block">{biometricState.credentialId || 'None registered'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Biometric Security Standard:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">FIDO2 ECDSA-P256</span>
            </div>
          </div>

          {/* Granular Biometric Trigger Policies */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
              Enforced Biometric Verification Triggers
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometricState.requireForLogin}
                  onChange={(e) => updateBiometricSettings({ requireForLogin: e.target.checked })}
                  disabled={!biometricState.enabled}
                  className="rounded text-[#c5a880] focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Quick Sign-In Login</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometricState.requireForWires}
                  onChange={(e) => updateBiometricSettings({ requireForWires: e.target.checked })}
                  disabled={!biometricState.enabled}
                  className="rounded text-[#c5a880] focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Wires &gt; $5,000</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometricState.requireForCardUnfreeze}
                  onChange={(e) => updateBiometricSettings({ requireForCardUnfreeze: e.target.checked })}
                  disabled={!biometricState.enabled}
                  className="rounded text-[#c5a880] focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Card Unfreeze</span>
              </label>
            </div>
          </div>

          {/* Test Scanner Button */}
          {biometricState.enabled && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => openBiometricPrompt({ 
                  mode: 'VERIFY', 
                  title: 'Test Native Biometric Hardware Scan', 
                  subtitle: 'Simulate on-device biometric sensor hardware verification.' 
                })}
                className="px-3.5 py-1.5 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] text-white hover:bg-[#163863] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-[#c5a880]/30"
              >
                <Scan className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Test Biometric Verification</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Theme & Visual Experience Setting */}
      <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 transition-colors">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
            Interface Theme &amp; Eye-Strain Reduction
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select your preferred display mode optimized for First Atlantic Bank &amp; Trust high-frequency institutional trading and ledger review.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Obsidian Dark Option */}
          <div
            onClick={() => setDarkMode(true)}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              darkMode 
                ? 'border-[#c5a880] bg-[#071322] text-white shadow-md' 
                : 'border-slate-200 dark:border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0a192f] text-[#c5a880] flex items-center justify-center border border-[#c5a880]/30">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Institutional Dark Theme</h4>
                <p className="text-[11px] text-slate-400">Obsidian Navy &amp; Gold • Low Eye Strain</p>
              </div>
            </div>
            {darkMode && <CheckCircle2 className="w-5 h-5 text-[#c5a880]" />}
          </div>

          {/* Daylight Light Option */}
          <div
            onClick={() => setDarkMode(false)}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              !darkMode 
                ? 'border-[#0a192f] bg-slate-50 text-slate-900 shadow-md' 
                : 'border-slate-200 dark:border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Daylight Classic Light</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">High-Contrast White &amp; Slate</p>
              </div>
            </div>
            {!darkMode && <CheckCircle2 className="w-5 h-5 text-[#0a192f]" />}
          </div>
        </div>
      </div>

      {/* 3. KYC Records & Personal Identity Profile */}
      <form onSubmit={handleSave} className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-6 transition-colors">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-14 h-14 rounded-full bg-[#0a192f] text-[#d4af37] flex items-center justify-center text-lg font-bold font-serif border border-[#c5a880]/30 shadow-sm">
            {firstName.charAt(0)}{lastName.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{firstName} {lastName}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Client Username: {currentUser?.username || 'jsterling'} • ID: {currentUser?.id || 'usr_sterling_01'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Primary Jurisdiction</label>
            <input
              type="text"
              readOnly
              value={region === 'US' ? 'United States (IRS Form W-9 On File)' : 'United Kingdom (HMRC FATCA On File)'}
              className="w-full px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">KYC Tier</label>
            <input
              type="text"
              readOnly
              value={currentUser?.kycTier ? String(currentUser.kycTier).replace(/_/g, ' ') : 'Private Client'}
              className="w-full px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[#8c6d37] dark:text-[#c5a880] font-bold"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#14325a] transition-colors cursor-pointer border border-[#c5a880]/30 shadow-md"
        >
          Save KYC Preferences
        </button>
      </form>
    </div>
  );
};
