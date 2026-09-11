import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { TransferAmountScreen } from './TransferAmountScreen';
import { TransferBeneficiaryScreen } from './TransferBeneficiaryScreen';
import { TransferAccountScreen } from './TransferAccountScreen';
import { TransferReferenceScreen } from './TransferReferenceScreen';
import { TransferReviewScreen } from './TransferReviewScreen';
import { TransferAuthorizeScreen } from './TransferAuthorizeScreen';
import { TransferSuccessScreen } from './TransferSuccessScreen';

export const TransferRoutes: React.FC = () => {
  const location = useLocation();

  const getStepProgress = (pathname: string) => {
    if (pathname.includes('/amount')) return 1;
    if (pathname.includes('/beneficiary') || pathname.includes('/account')) return 2;
    if (pathname.includes('/review')) return 3;
    if (pathname.includes('/authorize')) return 4;
    if (pathname.includes('/success')) return 5;
    return 1;
  };

  const currentStep = getStepProgress(location.pathname);

  return (
    <div className="min-h-full flex items-center justify-center py-4 sm:py-8 px-2 sm:px-4">
      <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden transition-all">
        {/* Step Bar Indicator (Except on Success receipt) */}
        {currentStep < 5 && (
          <div className="w-full bg-slate-800 h-1.5 flex">
            <div
              className="bg-blue-500 h-1.5 transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        )}

        {/* Nested Step Views */}
        <Routes>
          <Route path="/transfer/amount" element={<TransferAmountScreen />} />
          <Route path="/transfer/beneficiary" element={<TransferBeneficiaryScreen />} />
          <Route path="/transfer/account" element={<TransferBeneficiaryScreen />} />
          <Route path="/transfer/reference" element={<TransferReviewScreen />} />
          <Route path="/transfer/review" element={<TransferReviewScreen />} />
          <Route path="/transfer/authorize" element={<TransferAuthorizeScreen />} />
          <Route path="/transfer/success" element={<TransferSuccessScreen />} />

          <Route path="/amount" element={<TransferAmountScreen />} />
          <Route path="/beneficiary" element={<TransferBeneficiaryScreen />} />
          <Route path="/account" element={<TransferBeneficiaryScreen />} />
          <Route path="/reference" element={<TransferReviewScreen />} />
          <Route path="/review" element={<TransferReviewScreen />} />
          <Route path="/authorize" element={<TransferAuthorizeScreen />} />
          <Route path="/success" element={<TransferSuccessScreen />} />

          <Route path="/transfer" element={<TransferAmountScreen />} />
          <Route path="/" element={<TransferAmountScreen />} />
          <Route path="*" element={<TransferAmountScreen />} />
        </Routes>
      </div>
    </div>
  );
};

export default TransferRoutes;
