import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TransferRoutes } from '../transfer/TransferRoutes';
import { useTransferStore } from '../../store/useTransferStore';

export const TransfersPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchAccountsAndBalance } = useTransferStore();

  useEffect(() => {
    fetchAccountsAndBalance();
  }, [fetchAccountsAndBalance]);

  useEffect(() => {
    // If user arrived at transfers dashboard without specific step, navigate to /transfer/amount
    if (!location.pathname.startsWith('/transfer') || location.pathname === '/transfer') {
      navigate('/transfer/amount', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="w-full">
      <TransferRoutes />
    </div>
  );
};

export default TransfersPage;
