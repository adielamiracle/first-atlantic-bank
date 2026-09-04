import React from 'react';
import { InstitutionalCrest } from '../common/InstitutionalCrest';
import { useBank } from '../../context/BankContext';
import { Shield, Lock, Landmark, Award, ArrowUpRight } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const { region, setCurrentView, switchToAdmin } = useBank();

  return (
    <footer className="bg-[#050f1d] text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 pb-8 sm:pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <InstitutionalCrest size="md" variant="gold" />
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              First Atlantic Bank &amp; Trust Corporation provides comprehensive private, commercial, and wealth management services across the United States and the United Kingdom.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2 text-slate-400 font-mono text-[10px] sm:text-[11px]">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#c5a880]" /> 256-Bit SSL Encrypted
              </span>
              <span>•</span>
              <span>{region === 'US' ? 'Member FDIC' : 'Prudential Regulation Authority'}</span>
            </div>
          </div>

          {/* Column 1: Banking */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-xs font-serif">Banking &amp; Lending</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setCurrentView('PUBLIC_PERSONAL')} className="hover:text-white transition-colors">Premier Checking</button></li>
              <li><button onClick={() => setCurrentView('PUBLIC_PERSONAL')} className="hover:text-white transition-colors">High-Yield Savings (5.15% APY)</button></li>
              <li><button onClick={() => setCurrentView('PUBLIC_PERSONAL')} className="hover:text-white transition-colors">Atlantic Infinite Card</button></li>
              <li><button onClick={() => setCurrentView('PUBLIC_BUSINESS')} className="hover:text-white transition-colors">Commercial Mortgages</button></li>
              <li><button onClick={() => setCurrentView('PUBLIC_INTERNATIONAL')} className="hover:text-white transition-colors">Dual-Currency FX Escrow</button></li>
            </ul>
          </div>

          {/* Column 2: Wealth & Institutional */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-xs font-serif">Wealth &amp; Trust</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setCurrentView('PUBLIC_WEALTH')} className="hover:text-white transition-colors">Private Client Reserve</button></li>
              <li><button onClick={() => setCurrentView('PUBLIC_WEALTH')} className="hover:text-white transition-colors">Family Office Services</button></li>
              <li><button onClick={() => setCurrentView('PUBLIC_WEALTH')} className="hover:text-white transition-colors">Fiduciary &amp; Trust Assets</button></li>
              <li><button onClick={() => setCurrentView('PUBLIC_BUSINESS')} className="hover:text-white transition-colors">Treasury Liquidity Management</button></li>
            </ul>
          </div>

          {/* Column 3: Institutional Governance & Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-xs font-serif">Client Support &amp; Inquiries</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@firstatlanticbank.com" className="text-[#c5a880] hover:text-white transition-colors flex items-center gap-1.5 font-mono text-xs">
                  <span>support@firstatlanticbank.com</span>
                </a>
              </li>
              <li>
                <a href="mailto:contact@firstatlanticbank.com" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 font-mono text-xs">
                  <span>contact@firstatlanticbank.com</span>
                </a>
              </li>
              <li><button onClick={() => setCurrentView('PUBLIC_SECURITY')} className="hover:text-white transition-colors">Security Architecture</button></li>
              <li><button onClick={() => setCurrentView('PUBLIC_LOCATIONS')} className="hover:text-white transition-colors">Executive Branches</button></li>
              <li><button onClick={() => setCurrentView('PUBLIC_SECURITY')} className="hover:text-white transition-colors">Compliance &amp; Disclosures</button></li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclosures */}
        <div className="pt-8 text-[11px] leading-relaxed text-slate-400 space-y-3 font-sans">
          <p>
            <strong>Regulatory Disclosures:</strong> First Atlantic Bank N.A. (USA) is a nationally chartered financial institution regulated by the Office of the Comptroller of the Currency (OCC) and the Federal Reserve System. Deposits are insured up to $250,000 per depositor, per ownership category, by the Federal Deposit Insurance Corporation (FDIC). First Atlantic Bank UK PLC is authorized by the Prudential Regulation Authority (PRA) and regulated by the Financial Conduct Authority (FCA) and PRA (Financial Services Register No. 492019). Eligible deposits are protected up to £85,000 by the Financial Services Compensation Scheme (FSCS).
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800 text-slate-400 gap-3">
            <div>
              &copy; {new Date().getFullYear()} First Atlantic Bank &amp; Trust Corporation. All rights reserved. Equal Housing Lender.
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Online Banking</span>
              <span>•</span>
              <span>AML &amp; Patriot Act Disclosure</span>
              <span>•</span>
              <button
                onClick={() => {
                  window.location.hash = 'admin';
                  setCurrentView('AUTH_ADMIN_LOGIN');
                }}
                className="text-[#d4af37] hover:text-[#f3e5ab] font-bold flex items-center gap-1 cursor-pointer transition-colors underline decoration-[#d4af37]/40"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Institutional Admin Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
