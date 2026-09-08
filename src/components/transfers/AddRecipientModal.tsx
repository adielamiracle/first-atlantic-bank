import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { RecipientRegion, Recipient } from '../../types';
import {
  Building,
  User,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRecipientAdded?: (recipient: Recipient) => void;
}

export const AddRecipientModal: React.FC<Props> = ({ isOpen, onClose, onRecipientAdded }) => {
  const { addRecipient, showToast } = useBank();

  const [region, setRegion] = useState<RecipientRegion>('UK');
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // UK Specific
  const [sortCode, setSortCode] = useState('');
  const [ukAccountNumber, setUkAccountNumber] = useState('');

  // US Specific
  const [routingNumber, setRoutingNumber] = useState('');
  const [usAccountNumber, setUsAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<'CHECKING' | 'SAVINGS'>('CHECKING');

  // EU Specific
  const [iban, setIban] = useState('');
  const [swiftBic, setSwiftBic] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSortCodeChange = (val: string) => {
    // strip non-digits and limit to 6 digits, auto-insert dashes smoothly
    const digits = val.replace(/\D/g, '').slice(0, 6);
    if (digits.length <= 2) {
      setSortCode(digits);
    } else if (digits.length <= 4) {
      setSortCode(`${digits.slice(0, 2)}-${digits.slice(2)}`);
    } else {
      setSortCode(`${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`);
    }
  };

  const handleRoutingChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 9);
    setRoutingNumber(digits);
  };

  const handleIbanChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 34);
    // group by 4 for display
    const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
    setIban(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter recipient full name or legal entity name.');
      return;
    }
    if (!bankName.trim()) {
      setErrorMessage('Please enter beneficiary bank name.');
      return;
    }

    let payload: any = {
      name: name.trim(),
      bankName: bankName.trim(),
      region,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined
    };

    if (region === 'UK') {
      const cleanSort = sortCode.replace(/\D/g, '');
      if (cleanSort.length < 6) {
        setErrorMessage('UK Sort Code must be 6 digits (e.g. 20-04-15).');
        return;
      }
      const formattedSort = `${cleanSort.slice(0, 2)}-${cleanSort.slice(2, 4)}-${cleanSort.slice(4, 6)}`;
      const cleanAcc = ukAccountNumber.replace(/\D/g, '');
      if (cleanAcc.length < 6 || cleanAcc.length > 10) {
        setErrorMessage('UK Bank Account Number must be between 6 and 10 digits (standard 8 digits).');
        return;
      }
      payload = {
        ...payload,
        sortCode: formattedSort,
        accountNumberUk: cleanAcc,
        accountNumberOrIban: cleanAcc,
        country: 'United Kingdom'
      };
    } else if (region === 'US') {
      const cleanRouting = routingNumber.replace(/\D/g, '');
      if (cleanRouting.length !== 9) {
        setErrorMessage('US ABA Routing Number must be exactly 9 digits.');
        return;
      }
      const cleanAcc = usAccountNumber.replace(/\D/g, '');
      if (cleanAcc.length < 4 || cleanAcc.length > 17) {
        setErrorMessage('Please provide a valid US account number (4 to 17 digits).');
        return;
      }
      payload = {
        ...payload,
        routingNumber: cleanRouting,
        accountNumberUs: cleanAcc,
        accountNumberOrIban: cleanAcc,
        accountType,
        country: 'United States'
      };
    } else if (region === 'EU') {
      const cleanIban = iban.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (cleanIban.length < 14 || cleanIban.length > 34) {
        setErrorMessage('Please enter a valid International Bank Account Number (IBAN, 14-34 characters).');
        return;
      }
      payload = {
        ...payload,
        iban: cleanIban,
        accountNumberOrIban: cleanIban,
        swiftBic: swiftBic.trim().toUpperCase() || undefined,
        country: 'European Union'
      };
    }

    setIsSubmitting(true);
    try {
      const res = await addRecipient(payload);
      if (res.success && res.recipient) {
        onRecipientAdded?.(res.recipient);
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to add recipient');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving the recipient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto sm:my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#004281]/10 dark:bg-[#004281]/20 flex items-center justify-center text-[#004281] dark:text-sky-400 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">Add Bank Recipient</h3>
              <p className="text-[11px] text-slate-400 truncate">Instant transfer beneficiary for UK, US, or EU</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Region Selector - Mobile optimized */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Recipient Bank Region
          </label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { id: 'UK', label: 'UK', sub: 'GBP', flag: '🇬🇧', rail: 'Sort Code' },
              { id: 'US', label: 'USA', sub: 'USD', flag: '🇺🇸', rail: 'Routing' },
              { id: 'EU', label: 'Europe', sub: 'EUR', flag: '🇪🇺', rail: 'Euro IBAN' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setRegion(tab.id as RecipientRegion);
                  setErrorMessage('');
                }}
                className={`py-2 px-2 sm:px-3 rounded-xl border text-left cursor-pointer transition-all ${
                  region === tab.id
                    ? 'border-[#004281] bg-[#004281]/10 dark:bg-[#004281]/20 text-[#004281] dark:text-sky-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                  <span>{tab.flag}</span>
                  <span className="font-bold">{tab.label}</span>
                  <span className="text-[10px] opacity-75 font-normal hidden sm:inline">({tab.sub})</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{tab.rail}</div>
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-3.5 text-xs">
          {/* Recipient Full Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Beneficiary Full Name or Company Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Oliver Kensington or Global Holdings Ltd"
                className="w-full pl-9 pr-3 py-2.5 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
                autoCapitalize="words"
                autoCorrect="off"
                required
              />
            </div>
          </div>

          {/* Receiving Bank Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Receiving Bank Name *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder={
                  region === 'UK'
                    ? 'e.g. Barclays Bank UK PLC'
                    : region === 'US'
                    ? 'e.g. JPMorgan Chase Bank N.A.'
                    : 'e.g. Deutsche Bank AG'
                }
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
                autoCapitalize="words"
                autoCorrect="off"
                required
              />
            </div>
          </div>

          {/* REGION SPECIFIC FIELDS */}
          {region === 'UK' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  UK Sort Code (6 digits) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={sortCode}
                  onChange={e => handleSortCodeChange(e.target.value)}
                  placeholder="20-04-15"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
                  required
                />
                <span className="text-[10px] text-slate-400">Format: 20-04-15 or 6 digits</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Account Number (8 digits) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={ukAccountNumber}
                  onChange={e => setUkAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="83920194"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
                  required
                />
                <span className="text-[10px] text-slate-400">Standard UK bank account</span>
              </div>
            </div>
          )}

          {region === 'US' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    ABA Routing Number (9 digits) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={routingNumber}
                    onChange={e => handleRoutingChange(e.target.value)}
                    placeholder="021000021"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
                    required
                  />
                  <span className="text-[10px] text-slate-400">9-digit ABA Fedwire / ACH</span>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Account Type
                  </label>
                  <select
                    value={accountType}
                    onChange={e => setAccountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
                  >
                    <option value="CHECKING">Checking Account</option>
                    <option value="SAVINGS">Savings Account</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Account Number (4-17 digits) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={usAccountNumber}
                  onChange={e => setUsAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                  placeholder="991827364512"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
                  required
                />
              </div>
            </div>
          )}

          {region === 'EU' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Euro IBAN (International Bank Account Number) *
                </label>
                <input
                  type="text"
                  value={iban}
                  onChange={e => handleIbanChange(e.target.value)}
                  placeholder="DE89 5007 0010 0123 4567 89"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  required
                />
                <span className="text-[10px] text-slate-400">Supports SEPA Instant across Eurozone</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  SWIFT / BIC Code (Optional for SEPA)
                </label>
                <input
                  type="text"
                  value={swiftBic}
                  onChange={e => setSwiftBic(e.target.value.toUpperCase().slice(0, 11))}
                  placeholder="DEUTDEDDFXX"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
                  autoCapitalize="characters"
                  autoCorrect="off"
                />
              </div>
            </div>
          )}

          {/* Contact Details for notifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Recipient Email (Optional)</span>
              </label>
              <input
                type="text"
                inputMode="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="beneficiary@company.com"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number (Optional)</span>
              </label>
              <input
                type="text"
                inputMode="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+44 20 7946 0912"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
                autoCorrect="off"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-5 rounded-xl bg-[#004281] hover:bg-[#003366] text-white font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying & Saving...' : 'Save Recipient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
