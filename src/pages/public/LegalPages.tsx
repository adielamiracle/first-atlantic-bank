import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { InstitutionalCrest } from '../../components/common/InstitutionalCrest';
import {
  Shield,
  Lock,
  FileText,
  Building,
  ArrowLeft,
  Printer,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Globe,
  HelpCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface LegalPagesProps {
  initialTab?: 'privacy' | 'terms';
}

export const LegalPages: React.FC<LegalPagesProps> = ({ initialTab = 'privacy' }) => {
  const { setCurrentView } = useBank();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0D14] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Top Header */}
      <header className="bg-white dark:bg-[#11141D] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  setCurrentView('PUBLIC_HOME');
                }
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer min-h-[48px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <InstitutionalCrest size="sm" variant="gold" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => window.print()}
              className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[48px]"
              title="Print document"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Document</span>
            </button>
            <button
              onClick={() => setCurrentView('AUTH_LOGIN')}
              className="px-4 py-2 bg-[#00593B] hover:bg-[#00482f] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer min-h-[48px] flex items-center"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-center">
          <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1.5 rounded-2xl inline-flex gap-1 border border-slate-300 dark:border-slate-700 shadow-inner">
            <button
              id="legal-tab-privacy"
              onClick={() => {
                setActiveTab('privacy');
                window.location.hash = 'privacy';
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[48px] cursor-pointer flex items-center gap-2 ${
                activeTab === 'privacy'
                  ? 'bg-white dark:bg-[#1A1F2C] text-black dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#00593B] dark:text-[#34D399]" />
              <span>Privacy Policy</span>
            </button>
            <button
              id="legal-tab-terms"
              onClick={() => {
                setActiveTab('terms');
                window.location.hash = 'terms';
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[48px] cursor-pointer flex items-center gap-2 ${
                activeTab === 'terms'
                  ? 'bg-white dark:bg-[#1A1F2C] text-black dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-[#00593B] dark:text-[#34D399]" />
              <span>Terms of Online Banking</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        {activeTab === 'privacy' ? <PrivacyContent /> : <TermsContent />}

        {/* Support & Contact Footer */}
        <div className="bg-white dark:bg-[#11141D] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Questions regarding our legal disclosures?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our Data Protection Officer and Compliance Officers are available 24/7 for institutional inquiries.
            </p>
          </div>
          <a
            href="mailto:privacy@firstatlanticbank.com"
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold transition-colors shrink-0 min-h-[44px] flex items-center"
          >
            Contact Legal Officer
          </a>
        </div>
      </main>
    </div>
  );
};

const PrivacyContent: React.FC = () => (
  <article className="bg-white dark:bg-[#11141D] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
    <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#00593B] dark:text-[#34D399] text-xs font-bold font-mono">
        <Shield className="w-3.5 h-3.5" />
        Gramm-Leach-Bliley Act (GLBA) &amp; GDPR Compliant
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
        First Atlantic Bank Consumer &amp; Institutional Privacy Policy
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Effective Date: September 2026 • Last Reviewed by Board Risk Committee: Q3 2026
      </p>
    </div>

    <div className="space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
      <section className="space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          1. Our Institutional Privacy Commitment
        </h2>
        <p>
          First Atlantic Bank &amp; Trust Corporation (&quot;First Atlantic&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to safeguarding the confidentiality and integrity of our clients&apos; personal and financial data. This Privacy Policy discloses our data governance practices in accordance with the Gramm-Leach-Bliley Act (15 U.S.C. § 6801 et seq.), the California Consumer Privacy Act (CCPA/CPRA), the EU/UK General Data Protection Regulation (GDPR), and FDIC supervisory standards.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          2. Information We Collect
        </h2>
        <p>
          To deliver secure online banking, wire transfers, and regulatory compliance (including Bank Secrecy Act and USA PATRIOT Act customer identification obligations), we collect:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Identifying Information:</strong> Full legal name, date of birth, residential address, Social Security Number or Tax ID, passport biometric image, and contact details.</li>
          <li><strong>Financial &amp; Transactional Data:</strong> Account numbers, balances, wire instructions, counterparty information, payment history, and credit records.</li>
          <li><strong>Technical &amp; Device Identifiers:</strong> IP address, device telemetry, browser characteristics, geolocation for fraud prevention, and session timestamps.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          3. How We Protect Your Data
        </h2>
        <p>
          All electronic communications, database transactions, and cryptographic credentials are secured by 256-bit AES encryption in transit and at rest. Multi-factor authentication (MFA), biometric passkeys, hardware security modules (HSM), and continuous anomaly detection engines safeguard account operations.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          4. Zero Non-Affiliated Third-Party Marketing Sales
        </h2>
        <p>
          First Atlantic Bank does <strong>never</strong> sell, rent, or trade your personal information to third-party advertisers. Information is only disclosed to authorized clearing houses (e.g. Federal Reserve Bank, SWIFT, CHAPS), regulatory examiners (OCC, FDIC, FCA), or vetted technical processors under strict non-disclosure obligations.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          5. Consumer Rights &amp; Opt-Out Provisions
        </h2>
        <p>
          You possess the right to inspect, correct, or request deletion of personal information where not mandated for regulatory retention under the Bank Secrecy Act. To exercise your privacy preferences, contact your private client officer or email <span className="font-mono font-semibold text-[#00593B] dark:text-[#34D399]">privacy@firstatlanticbank.com</span>.
        </p>
      </section>
    </div>
  </article>
);

const TermsContent: React.FC = () => (
  <article className="bg-white dark:bg-[#11141D] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
    <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold font-mono">
        <FileText className="w-3.5 h-3.5" />
        E-SIGN Act &amp; Uniform Commercial Code (UCC-4A)
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
        Terms and Conditions of Online &amp; Mobile Banking
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Effective Version 4.8 • Applies to all consumer, private client, and commercial accounts
      </p>
    </div>

    <div className="space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
      <section className="space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          1. Acceptance of Electronic Banking Agreement
        </h2>
        <p>
          By accessing or utilizing First Atlantic Online and Mobile Banking services, or by clicking &quot;AUTHORIZE &amp; EXECUTE&quot; on transfer forms, you acknowledge and agree to be legally bound by these terms, our Deposit Account Agreement, and electronic disclosure rules under the Electronic Signatures in Global and National Commerce Act (E-SIGN).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          2. Funds Transfers, Wires, and Settlement
        </h2>
        <p>
          All outbound domestic wires and SWIFT cross-border transfers are governed by Uniform Commercial Code Article 4A (UCC-4A) and Regulation E:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Execution &amp; Cutoff Times:</strong> Transfers submitted prior to 4:30 PM EST are processed same-day. Instructions queued after cutoff or on federal reserve bank holidays will settle on the next financial banking day.</li>
          <li><strong>Accuracy of Account Numbers:</strong> The beneficiary bank may rely strictly on the recipient bank account number provided (9-12 numeric digits or IBAN) even if it identifies a party different from the named beneficiary.</li>
          <li><strong>Cancellation:</strong> Wire transfers are executed instantaneously through automated clearing networks; once posted, payment orders cannot be revoked or canceled without beneficiary bank indemnification.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          3. Security Credentials &amp; Unauthorized Access
        </h2>
        <p>
          You are responsible for maintaining the confidentiality of your username, password, security PIN, and biometric tokens. Notify First Atlantic Fraud Concierge immediately at +1 (800) 555-FAB-USA if you suspect compromised credentials. Under Federal Reserve Regulation E, timely reporting limits your liability for unauthorized electronic fund transfers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          4. Availability of Funds &amp; Deposit Insurance
        </h2>
        <p>
          Consumer and commercial deposit accounts are insured up to $250,000 per depositor by the FDIC in the United States, and up to £85,000 by the Financial Services Compensation Scheme (FSCS) for UK accounts. Funds availability is subject to Federal Reserve Regulation CC.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          5. Governing Law &amp; Dispute Resolution
        </h2>
        <p>
          This Agreement is governed by the laws of the State of New York and applicable federal banking regulations without regard to conflicts of law principles. Any dispute arising under this agreement shall be subject to binding institutional arbitration under the American Arbitration Association rules.
        </p>
      </section>
    </div>
  </article>
);

export const PrivacyPage: React.FC = () => <LegalPages initialTab="privacy" />;
export const TermsPage: React.FC = () => <LegalPages initialTab="terms" />;

