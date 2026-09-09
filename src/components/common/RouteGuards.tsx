import React, { useEffect } from 'react';
import { useBank } from '../../context/BankContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * UserRoute Guard:
 * Protects customer views. If not authenticated or not logged in,
 * safely redirects to customer login (`AUTH_LOGIN`).
 */
export const UserRoute: React.FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated, currentRole, setCurrentView } = useBank();

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentView('AUTH_LOGIN');
    }
  }, [isAuthenticated, currentRole, setCurrentView]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

/**
 * AdminRoute Guard:
 * Strictly enforces Role-Based Access Control (RBAC).
 * - Regular customers trying to access admin are immediately bounced to customer dashboard (hides admin).
 * - Unauthenticated visitors are redirected to the dedicated admin credential login (`AUTH_ADMIN_LOGIN`).
 * - Only verified ADMIN users can render the administrative interfaces.
 */
export const AdminRoute: React.FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated, currentRole, setCurrentView } = useBank();

  useEffect(() => {
    if (currentRole === 'CUSTOMER') {
      // Never allow regular users into admin desk
      setCurrentView('DASHBOARD_OVERVIEW');
    } else if (currentRole !== 'ADMIN') {
      setCurrentView('AUTH_ADMIN_LOGIN');
    }
  }, [isAuthenticated, currentRole, setCurrentView]);

  if (currentRole === 'CUSTOMER') {
    return null;
  }

  if (currentRole !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
};
