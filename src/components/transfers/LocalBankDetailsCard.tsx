import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import {
  Building,
  Copy,
  Check,
  Globe,
  ShieldCheck,
  Zap,
  Info,
  QrCode,
  Share2,
  CheckCircle2
} from 'lucide-react';

interface Props {
  onClose?: () => void;
  compact?: boolean;
}

export const LocalBankDetailsCard: React.FC<Props> = ({ onClose, compact = false }) => {
  const { currentUser, accounts, bankReceivingAccounts, showToast } = useBank();
  const [selectedRegion, setSelectedRegion] = useState<'UK' | 'US' | 'EU'>('UK');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  // Find user's primary checking or premier account
  const primaryAccount = accounts.find(a => a.type === 'CHECKING') || accounts[0];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast('SUCCESS', 'Copied to Clipboard', `${label} copied.`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Find configured treasury accounts or use canonical First Atlantic regional clearing details
  const treasuryUK = bankReceivingAccounts.find(a => a.currency === 'GBP' || a.region === 'UK');
  const treasuryUS = bankReceivingAccounts.find(a => a.currency === 'USD' || a.region === 'US');
  const treasuryEU = bankReceivingAccounts.find(a => a.currency === 'EUR' || a.region === 'EU');

  // Customer account numbers formatted for regional clearing
  const clientName = `${currentUser?.firstName || 'Valued'} ${currentUser?.lastName || 'Client'}`;
  const baseAccNum = primaryAccount?.accountNumber?.replace(/\D/g, '') || '82910482';

  const bankDetails = {
    UK: {
      regionName: 'United Kingdom',
      flag: '🇬🇧',
      currency: 'GBP (£)',
      clearingSystem: 'UK Faster Payments & BACS',
      deliverySpeed: 'Instant (under 2 hours)',
      bankName: treasuryUK?.bankName || 'First Atlantic Bank UK Ltd (Canary Wharf, London)',
      bankAddress: treasuryUK?.bankAddress || '25 Bank Street, Canary Wharf, London E14 5JP, UK',
      beneficiaryName: clientName,
      accountNumber: treasuryUK?.accountNumberOrIban?.slice(0, 8) || '99401820',
      sortCode: treasuryUK?.sortCode || '20-04-15',
      iban: treasuryUK?.iban || 'GB44FATL20041599401820',
      swiftBic: treasuryUK?.swiftBic || 'FATLGB2LXXX',
      referenceRule: `Quote Ref: FAB-${baseAccNum.slice(-6)} or "${clientName.toUpperCase()}"`,
      supportedTypes: ['Faster Payments (FPS)', 'BACS Direct Credit', 'CHAPS High-Value Wire']
    },
    US: {
      regionName: 'United States',
      flag: '🇺🇸',
      currency: 'USD ($)',
      clearingSystem: 'Fedwire Direct & ACH Network',
      deliverySpeed: 'Same-day via Fedwire (1-2 days ACH)',
      bankName: treasuryUS?.bankName || 'First Atlantic Bank N.A. (Wall Street, NYC)',
      bankAddress: treasuryUS?.bankAddress || '60 Wall Street, 28th Floor, New York, NY 10005, USA',
      beneficiaryName: clientName,
      accountNumber: primaryAccount?.accountNumber || '882019482910',
      routingNumber: treasuryUS?.routingNumber || '026009593',
      accountType: 'Checking / Private Wealth',
      swiftBic: treasuryUS?.swiftBic || 'FATLUS33NYC',
      referenceRule: `Quote Ref: ACC-${primaryAccount?.accountNumber?.slice(-6) || '4920'}`,
      supportedTypes: ['Fedwire Funds Service', 'NACHA ACH Direct Deposit', 'Book Transfer']
    },
    EU: {
      regionName: 'European Union',
      flag: '🇪🇺',
      currency: 'EUR (€)',
      clearingSystem: 'SEPA Instant & TARGET2 Clearing',
      deliverySpeed: 'Real-time (SEPA Instant 10 seconds)',
      bankName: treasuryEU?.bankName || 'First Atlantic Bank Europe S.A. (Frankfurt)',
      bankAddress: treasuryEU?.bankAddress || 'Mainzer Landstraße 46, 60325 Frankfurt am Main, Germany',
      beneficiaryName: clientName,
      iban: treasuryEU?.accountNumberOrIban || 'DE89 5001 0517 9920 1849 00',
      swiftBic: treasuryEU?.swiftBic || 'FATLDEFFXXX',
      clearingIntermediary: 'ECB TARGET2 / Deutsche Bundesbank Gate',
      referenceRule: `Quote Ref: EUR-${baseAccNum.slice(-6)} / ${clientName.toUpperCase()}`,
      supportedTypes: ['SEPA Instant Credit Transfer (SCT Inst)', 'SEPA Core Credit Transfer', 'TARGET2 RTGS']
    }
  };

  const current = bankDetails[selectedRegion];

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              International Inbound Routing
            </span>
            <h3 className="text-base sm:text-lg font-bold">Local Receiving Bank Details</h3>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            &times;
          </button>
        )}
      </div>

      {/* Region Selector Tabs (UK, US, EU) */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Select a currency corridor below to receive payments from individuals, employers, or institutions like a local resident.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(['UK', 'US', 'EU'] as const).map(reg => {
            const isSel = selectedRegion === reg;
            const data = bankDetails[reg];
            return (
              <button
                key={reg}
                type="button"
                onClick={() => setSelectedRegion(reg)}
                className={`py-2.5 px-3 rounded-xl text-left transition-all border cursor-pointer ${
                  isSel
                    ? 'bg-[#004281] text-white border-[#004281] shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{data.flag}</span>
                  <div>
                    <div className="text-xs font-bold leading-tight">{reg} ({data.currency.split(' ')[0]})</div>
                    <div className={`text-[10px] truncate ${isSel ? 'text-slate-200' : 'text-slate-400'}`}>
                      {data.clearingSystem.split('&')[0]}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Details Display Body */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Speed / Rail banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Clearing Rail: {current.clearingSystem}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
            {current.deliverySpeed}
          </span>
        </div>

        {/* Data Fields */}
        <div className="space-y-2.5">
          {/* Beneficiary Name */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Beneficiary Name</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{current.beneficiaryName}</span>
            </div>
            <button
              onClick={() => copyToClipboard(current.beneficiaryName, 'Beneficiary Name')}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title="Copy Beneficiary Name"
            >
              {copiedField === 'Beneficiary Name' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Receiving Bank */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Receiving Institution</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">{current.bankName}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{current.bankAddress}</span>
            </div>
            <button
              onClick={() => copyToClipboard(current.bankName, 'Bank Name')}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              {copiedField === 'Bank Name' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Region Specific Fields */}
          {selectedRegion === 'UK' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">UK Sort Code</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{current.sortCode}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(current.sortCode!, 'Sort Code')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                >
                  {copiedField === 'Sort Code' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">Account Number</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{current.accountNumber}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(current.accountNumber!, 'Account Number')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                >
                  {copiedField === 'Account Number' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">IBAN (International Ingress)</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{current.iban}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(current.iban!, 'UK IBAN')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                >
                  {copiedField === 'UK IBAN' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {selectedRegion === 'US' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">ACH &amp; Fedwire Routing (ABA)</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{current.routingNumber}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(current.routingNumber!, 'ABA Routing')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                >
                  {copiedField === 'ABA Routing' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">Account Number</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{current.accountNumber}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(current.accountNumber!, 'Account Number')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                >
                  {copiedField === 'Account Number' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">Account Type / SWIFT</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">Checking • SWIFT: {current.swiftBic}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(current.swiftBic!, 'SWIFT BIC')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                >
                  {copiedField === 'SWIFT BIC' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {selectedRegion === 'EU' && (
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">Euro IBAN (SEPA Instant)</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono tracking-wider">{current.iban}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(current.iban!, 'EU IBAN')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                >
                  {copiedField === 'EU IBAN' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">BIC / SWIFT</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{current.swiftBic}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(current.swiftBic!, 'EU BIC')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                >
                  {copiedField === 'EU BIC' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Reference Requirement */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block">Payment Reference Recommendation</span>
                <span className="text-[11px] text-amber-800 dark:text-amber-300">{current.referenceRule}</span>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(current.referenceRule.replace('Quote Ref: ', ''), 'Payment Reference')}
              className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 cursor-pointer"
            >
              {copiedField === 'Payment Reference' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action footer */}
        <div className="pt-2 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>FDIC &amp; FSCS Protected Custody Routing</span>
          </div>

          <button
            type="button"
            onClick={() => {
              const fullDetails = `FIRST ATLANTIC BANK - LOCAL RECEIVING DETAILS (${selectedRegion})\nBeneficiary: ${current.beneficiaryName}\nBank: ${current.bankName}\nAddress: ${current.bankAddress}\n${selectedRegion === 'UK' ? `Sort Code: ${current.sortCode}\nAccount: ${current.accountNumber}\nIBAN: ${current.iban}` : selectedRegion === 'US' ? `Routing (ABA): ${current.routingNumber}\nAccount: ${current.accountNumber}\nSWIFT: ${current.swiftBic}` : `IBAN: ${current.iban}\nBIC: ${current.swiftBic}`}\nReference: ${current.referenceRule}`;
              copyToClipboard(fullDetails, 'Full Wire Instructions');
            }}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy All Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
