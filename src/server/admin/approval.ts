import { Router, Request, Response } from 'express';
import { db } from '../db';
import { AdminUser, UserApprovalStatus } from '../../types';

export const adminApprovalRouter = Router();

/**
 * Helper to extract authenticated administrator context from request headers
 */
function getAdminFromHeader(req: Request): AdminUser {
  const adminId = req.headers['x-admin-id'] as string;
  if (adminId && db.adminUsers.has(adminId)) {
    return db.adminUsers.get(adminId)!;
  }
  // Single Master Administrator
  if (db.adminUsers.has('adm_master_01')) {
    return db.adminUsers.get('adm_master_01')!;
  }
  return {
    id: 'adm_master_01',
    email: 'admin@firstatlanticbank.com',
    name: 'Alexandra Vance',
    role: 'SUPER_ADMIN',
    department: 'Executive Risk, Governance & Master Administration',
    lastLogin: new Date().toISOString(),
    status: 'ACTIVE'
  };
}

/**
 * GET /api/admin/approval/users
 * Returns list of all user profiles with their approval status and linked account counts
 */
adminApprovalRouter.get('/users', (req: Request, res: Response) => {
  const users = Array.from(db.users.values()).map(user => {
    const userAccounts = Array.from(db.accounts.values()).filter(a => a.userId === user.id);
    const userCards = Array.from(db.cards.values()).filter(c => c.userId === user.id);
    return {
      ...user,
      accountsCount: userAccounts.length,
      cardsCount: userCards.length,
      totalBalanceMinor: userAccounts.reduce((sum, acc) => sum + acc.balanceMinor, 0)
    };
  });

  res.json({ users });
});

/**
 * GET /api/admin/approval/activation-queue
 * Returns all dual-signature account activation requests
 */
adminApprovalRouter.get('/activation-queue', (req: Request, res: Response) => {
  const { status } = req.query;
  let queue = db.activationRequests;
  if (status && status !== 'ALL') {
    queue = queue.filter(r => r.status === status);
  }

  const stats = {
    pendingDualApproval: db.activationRequests.filter(r => r.status === 'PENDING_DUAL_APPROVAL').length,
    activated: db.activationRequests.filter(r => r.status === 'ACTIVATED').length,
    rejected: db.activationRequests.filter(r => r.status === 'REJECTED').length
  };

  res.json({
    queue,
    stats
  });
});

/**
 * POST /api/admin/approval/toggle-user
 * or POST /api/admin/approval/users/:userId/toggle
 * Toggle user account access (switch between APPROVED and SUSPENDED)
 */
adminApprovalRouter.post('/toggle-user', (req: Request, res: Response) => {
  const admin = getAdminFromHeader(req);
  const { userId, reason } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }

  const result = db.toggleUserAccess(admin, userId, reason);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    user: result.user,
    message: `User account access updated to ${result.user?.approval_status}.`
  });
});

adminApprovalRouter.post('/users/:userId/toggle', (req: Request, res: Response) => {
  const admin = getAdminFromHeader(req);
  const { userId } = req.params;
  const { reason } = req.body;

  const result = db.toggleUserAccess(admin, userId, reason);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    user: result.user,
    message: `User account access updated to ${result.user?.approval_status}.`
  });
});

/**
 * POST /api/admin/approval/users/:userId/status
 * Explicitly set user approval status ('APPROVED' | 'SUSPENDED' | 'REJECTED' | 'PENDING')
 */
adminApprovalRouter.post('/users/:userId/status', (req: Request, res: Response) => {
  const admin = getAdminFromHeader(req);
  const { userId } = req.params;
  const { status, reason } = req.body as { status: UserApprovalStatus; reason?: string };

  if (!status || !['APPROVED', 'SUSPENDED', 'REJECTED', 'PENDING'].includes(status)) {
    return res.status(400).json({ error: 'Invalid approval status provided.' });
  }

  const result = db.setUserApprovalStatus(admin, userId, status, reason);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    user: result.user,
    message: `User approval status set to ${status}.`
  });
});

/**
 * POST /api/admin/approval/activation-queue/create
 * Propose an account activation request (Maker signature step)
 */
adminApprovalRouter.post('/activation-queue/create', (req: Request, res: Response) => {
  const admin = getAdminFromHeader(req);
  const { userId, targetStatus, reason, notes } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required for activation request.' });
  }

  const result = db.createActivationRequest(admin, userId, targetStatus || 'APPROVED', reason || 'Institutional Account Onboarding Verification', notes);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    request: result.request,
    message: 'Dual-signature activation request logged and dispatched to Checker queue.'
  });
});

/**
 * POST /api/admin/approval/activation-queue/:id/approve
 * Authorize and sign off on account activation (Checker signature step)
 */
adminApprovalRouter.post('/activation-queue/:id/approve', (req: Request, res: Response) => {
  const admin = getAdminFromHeader(req);
  const { id } = req.params;
  const { notes } = req.body;

  const result = db.approveActivationRequest(admin, id, notes);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    request: result.request,
    user: result.user,
    message: `Dual-signature verification confirmed. Account activated for ${result.request?.userName}.`
  });
});

/**
 * POST /api/admin/approval/activation-queue/:id/reject
 * Decline dual-signature account activation
 */
adminApprovalRouter.post('/activation-queue/:id/reject', (req: Request, res: Response) => {
  const admin = getAdminFromHeader(req);
  const { id } = req.params;
  const { notes } = req.body;

  const result = db.rejectActivationRequest(admin, id, notes);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    request: result.request,
    message: 'Account activation request declined.'
  });
});

export default adminApprovalRouter;
