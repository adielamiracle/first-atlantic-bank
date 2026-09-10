import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TransferAmountScreen } from './TransferAmountScreen';
import { TransferAccountScreen } from './TransferAccountScreen';
import { TransferReferenceScreen } from './TransferReferenceScreen';
import { TransferReviewScreen } from './TransferReviewScreen';
import { TransferAuthorizeScreen } from './TransferAuthorizeScreen';
import { TransferSuccessScreen } from './TransferSuccessScreen';

export const TransferRoutes: React.FC = () => {
  const location = useLocation();

  const getStepProgress = (pathname: string) => {
    if (pathname.includes('/amount')) return 1;
    if (pathname.includes('/account')) return 2;
    if (pathname.includes('/reference')) return 3;
    if (pathname.includes('/review')) return 4;
    if (pathname.includes('/authorize')) return 5;
    if (pathname.includes('/success')) return 6;
    return 1;
  };

  const currentStep = getStepProgress(location.pathname);

  return (
    <div className="min-h-full flex items-center justify-center py-4 sm:py-8 px-2 sm:px-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
        {/* Subtle Step Bar Indicator (Except on Success receipt) */}
        {currentStep < 6 && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 flex">
            <div
              className="bg-red-600 h-1.5 transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        )}

        {/* Nested Step Views */}
        <Routes>
          <Route path="/transfer/amount" element={<TransferAmountScreen />} />
          <Route path="/transfer/account" element={<TransferAccountScreen />} />
          <Route path="/transfer/reference" element={<TransferReferenceScreen />} />
          <Route path="/transfer/review" element={<TransferReviewScreen />} />
          <Route path="/transfer/authorize" element={<TransferAuthorizeScreen />} />
          <Route path="/transfer/success" element={<TransferSuccessScreen />} />

          <Route path="/amount" element={<TransferAmountScreen />} />
          <Route path="/account" element={<TransferAccountScreen />} />
          <Route path="/reference" element={<TransferReferenceScreen />} />
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
