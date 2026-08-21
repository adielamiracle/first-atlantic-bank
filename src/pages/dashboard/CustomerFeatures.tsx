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
  Eye
} from 'lucide-react';

export const DepositCheckPage: React.FC = () => {
  const { accounts, executeCheckDeposit, showToast } = useBank();

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
    try {
      const res = await executeCheckDeposit(
        accountId,
        amountMinor,
        checkNumber,
        payerName
      );

      if (res.success) {
        setDepositSuccess(res);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
        <h1 className="text-xl font-bold font-serif text-slate-900">
          Mobile &amp; Remote Check Capture
        </h1>
        <p className="text-xs text-slate-500">
          Instant digital clearing with automated optical MICR character recognition and funds availability rules.
        </p>
      </div>

      {depositSuccess ? (
        <div className="bg-white rounded-2xl p-8 border border-emerald-200 shadow-md text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-serif text-slate-900">Check Endorsed &amp; Accepted</h2>
            <p className="text-xs text-slate-600">{depositSuccess.message}</p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2 text-slate-700 font-mono text-left">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Immediate Availability:</span>
              <span className="font-bold font-sans text-emerald-600">$500.00 (Instant)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Full Ledger Release:</span>
              <span className="font-bold font-sans">Next Business Day 9:00 AM</span>
            </div>
          </div>

          <button
            onClick={() => {
              setDepositSuccess(null);
              setAmountStr('');
            }}
            className="px-6 py-2.5 rounded-xl bg-[#0a192f] text-white font-bold text-xs uppercase"
          >
            Deposit Another Check
          </button>
        </div>
      ) : (
        <form onSubmit={handleDeposit} className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Deposit Into Account
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Check Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Check Serial #
              </label>
              <input
                type="text"
                required
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Check Issuer / Payer
            </label>
            <input
              type="text"
              required
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
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
                frontCaptured ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900' : 'border-slate-300 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Camera className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {frontCaptured ? '✓ Front Image Captured' : 'Capture Check Front'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Tap to simulate camera scan</span>
            </div>

            <div
              onClick={() => {
                setBackCaptured(true);
                showToast('SUCCESS', 'Back Check Captured', 'Endorsement signature recognized.');
              }}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                backCaptured ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900' : 'border-slate-300 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Camera className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {backCaptured ? '✓ Back Image Endorsed' : 'Capture Check Back'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Requires endorsement signature</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2"
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-slate-900">
            Electronic Statements &amp; Tax Documents
          </h1>
          <p className="text-xs text-slate-500">
            Official monthly account transcripts, 1099-INT dividend summaries, and audit confirmations.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Current Page</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {statements.map((stmt) => (
          <div key={stmt.period} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0a192f] text-[#d4af37] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{stmt.period} Monthly Statement</h3>
                <p className="text-xs text-slate-500 font-mono">Issued: {stmt.date} • {stmt.size} • Cryptographically Signed</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedStatement(stmt)}
                className="px-3.5 py-1.5 rounded-lg border border-[#0a192f] text-[#0a192f] hover:bg-[#0a192f] hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
              <button
                onClick={() => handleDownload(stmt.period, 'PDF')}
                className="px-3.5 py-1.5 rounded-lg bg-[#0a192f] hover:bg-[#132d52] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleDownload(stmt.period, 'CSV')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                CSV
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Statement Preview Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-300 space-y-6 text-slate-900">
            {/* Statement Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center font-serif font-bold text-sm">
                    FAB
                  </div>
                  <span className="font-serif font-bold text-lg text-slate-900">First Atlantic Bank</span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1">Institutional Private Wealth &amp; Commercial Banking</p>
              </div>

              <div className="text-right font-mono text-xs text-slate-600">
                <div className="font-bold text-slate-900 uppercase">Official Account Statement</div>
                <div>Period: {selectedStatement.period}</div>
                <div>Statement Date: {selectedStatement.date}</div>
              </div>
            </div>

            {/* Client & Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs font-mono border border-slate-200">
              <div>
                <div className="text-slate-400 uppercase text-[10px]">Account Holder</div>
                <div className="font-bold text-slate-900 font-sans text-sm">{currentUser?.name || 'Jonathan Sterling'}</div>
                <div className="text-slate-600">CIF: {currentUser?.cifNumber || 'FAB-99201948'}</div>
              </div>
              <div className="sm:text-right">
                <div className="text-slate-400 uppercase text-[10px]">Primary Account</div>
                <div className="font-bold text-slate-900 font-sans text-sm">{primaryAccount?.name || 'Private Wealth Checking'}</div>
                <div className="text-slate-600">Acct #{primaryAccount?.accountNumber || '•••• 8819'} • Routing: 021000021</div>
              </div>
            </div>

            {/* Balance Summary */}
            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Starting Balance</div>
                <div className="text-sm font-bold text-slate-800">${(selectedStatement.startBal / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Net Activity</div>
                <div className="text-sm font-bold text-emerald-600">+${((selectedStatement.endBal - selectedStatement.startBal) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Closing Balance</div>
                <div className="text-sm font-bold text-[#8c6d37]">${(selectedStatement.endBal / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* Transactions itemization */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-serif">Transaction Itemization</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Channel</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-500">{new Date(tx.createdTimestamp).toLocaleDateString()}</td>
                        <td className="p-2.5 text-slate-800 font-sans font-medium">{tx.description}</td>
                        <td className="p-2.5 text-slate-500 text-[10px]">{tx.channel}</td>
                        <td className={`p-2.5 text-right font-bold ${tx.direction === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {tx.direction === 'CREDIT' ? '+' : '-'}${((tx.amountMinor || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Security seal and dismissal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cryptographic Digest: SHA256-7f8a91b2c3d4e5f6... (Official Transcript)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedStatement(null)}
                  className="px-5 py-2 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white font-bold text-xs"
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
  const { showToast } = useBank();

  const handleRevoke = (device: string) => {
    showToast('SUCCESS', 'Session Terminated', `Device session for ${device} has been revoked.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-slate-900">
            Security Governance &amp; Threat Defense
          </h1>
          <p className="text-xs text-slate-500">
            Manage your cryptographic credentials, hardware tokens, and authorized devices.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Security Score: 94 / 100 (Optimal)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Active Authorized Devices */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-serif">
            Active Registered Sessions
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-slate-700" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">MacBook Pro (Safari 18.2)</h4>
                  <p className="text-[10px] text-emerald-700 font-medium">This Current Session • New York, USA</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Active</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-700" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">iPhone 16 Pro (FAB Mobile App)</h4>
                  <p className="text-[10px] text-slate-500">Last active 3 hours ago • Boston, USA</p>
                </div>
              </div>
              <button
                onClick={() => handleRevoke('iPhone 16 Pro')}
                className="text-[11px] text-rose-600 hover:underline font-semibold"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>

        {/* Right: Security Settings & Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-serif">
            MFA &amp; Fraud Monitoring
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Two-Factor Authentication (MFA)</div>
                <div className="text-[11px] text-slate-500">Hardware TOTP &amp; SMS verification</div>
              </div>
              <span className="text-emerald-700 font-bold">Enabled</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Passkey / Biometric Auth</div>
                <div className="text-[11px] text-slate-500">FIDO2 WebAuthn TouchID/FaceID</div>
              </div>
              <span className="text-emerald-700 font-bold">Registered</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <div>
                <div className="font-bold text-slate-900">Large Wire SMS Pre-Authorization</div>
                <div className="text-[11px] text-slate-500">Mandatory for transfers &gt; $10,000</div>
              </div>
              <span className="text-emerald-700 font-bold">Enforced</span>
            </div>
          </div>

          <button
            onClick={() => showToast('INFO', 'Suspicious Activity Report', 'Security incident report opened. Fraud ops dispatched.')}
            className="w-full py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
        <h1 className="text-xl font-bold font-serif text-slate-900">
          Encrypted Private Wealth Concierge
        </h1>
        <p className="text-xs text-slate-500">
          End-to-end encrypted direct communication channel with your assigned senior private banking officer.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
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
                    ? 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                    : 'bg-[#0a192f] text-white rounded-tr-none shadow-sm'
                }`}
              >
                {m.body}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
          <input
            type="text"
            placeholder="Type encrypted message to private banker..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#8c6d37]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
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
  const { currentUser, showToast, region } = useBank();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('SUCCESS', 'Profile Updated', 'KYC and communication preferences saved.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
        <h1 className="text-xl font-bold font-serif text-slate-900">
          Client Profile &amp; Regulatory Governance
        </h1>
        <p className="text-xs text-slate-500">
          KYC verification records, tax residency classification, and delivery preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full bg-[#0a192f] text-[#d4af37] flex items-center justify-center text-lg font-bold font-serif">
            {currentUser?.firstName[0]}{currentUser?.lastName[0]}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{currentUser?.firstName} {currentUser?.lastName}</h3>
            <p className="text-xs text-slate-500 font-mono">Client Username: {currentUser?.username} • ID: {currentUser?.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              defaultValue={currentUser?.email}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              defaultValue={currentUser?.phone}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Primary Jurisdiction</label>
            <input
              type="text"
              readOnly
              value={region === 'US' ? 'United States (IRS Form W-9 On File)' : 'United Kingdom (HMRC FATCA On File)'}
              className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">KYC Tier</label>
            <input
              type="text"
              readOnly
              value={currentUser?.kycTier.replace(/_/g, ' ')}
              className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-[#8c6d37] font-bold"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#0a192f] text-white font-bold text-xs uppercase tracking-wider"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};
