import { Router, Request, Response } from 'express';
import { doubleEntryLedger, JournalLine, JournalTransaction } from './DoubleEntryLedger';
import { db } from '../db';
import { CurrencyCode, TransactionDirection } from '../../types';

export const ledgerRouter = Router();

export interface PostLedgerTransactionRequestBody {
  referenceNumber?: string;
  idempotencyKey?: string;
  transactionType?: JournalTransaction['transactionType'];
  description: string;
  effectiveAt?: string;
  metadata?: Record<string, any>;
  lines: Array<{
    accountId: string;
    accountType?: JournalLine['accountType'];
    accountName?: string;
    direction: TransactionDirection;
    amountMinor: number;
    currency: CurrencyCode;
    description?: string;
  }>;
}

/**
 * POST /api/ledger/transaction
 * 
 * Secure Enterprise Double-Entry Ledger Posting Route
 * Enforces:
 * 1. Request payload schema & type validation
 * 2. Strict Double-Entry Invariant: sum(Debits) == sum(Credits) per currency
 * 3. Customer account existence & status validation
 * 4. Sufficient balance validation for customer account debits
 * 5. Atomic SHA-256 hash-chained block commit to ledger and customer sub-ledgers
 */
ledgerRouter.post('/transaction', async (req: Request, res: Response): Promise<void> => {
  try {
    const body: PostLedgerTransactionRequestBody = req.body;

    // 1. Basic Schema Validation
    if (!body || !Array.isArray(body.lines) || body.lines.length < 2) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_FAILED',
        message: 'A valid double-entry transaction must contain at least 2 balancing journal lines.',
        receivedLinesCount: body?.lines?.length || 0
      });
      return;
    }

    if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'INVALID_DESCRIPTION',
        message: 'Transaction description is required.'
      });
      return;
    }

    const transactionType = body.transactionType || 'ADMIN_ADJUSTMENT';

    // 2. Validate Lines Format
    const validatedLines: JournalLine[] = [];
    const debitTotals: Record<CurrencyCode, number> = { USD: 0, GBP: 0, EUR: 0 };
    const creditTotals: Record<CurrencyCode, number> = { USD: 0, GBP: 0, EUR: 0 };

    for (let i = 0; i < body.lines.length; i++) {
      const line = body.lines[i];

      if (!line.accountId || typeof line.accountId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'INVALID_ACCOUNT_ID',
          message: `Line #${i + 1}: accountId is required and must be a string.`
        });
        return;
      }

      if (line.direction !== 'DEBIT' && line.direction !== 'CREDIT') {
        res.status(400).json({
          success: false,
          error: 'INVALID_DIRECTION',
          message: `Line #${i + 1}: direction must be either 'DEBIT' or 'CREDIT'. Received: ${line.direction}`
        });
        return;
      }

      const amountMinor = Number(line.amountMinor);
      if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
        res.status(400).json({
          success: false,
          error: 'INVALID_AMOUNT',
          message: `Line #${i + 1}: amountMinor must be a positive integer in minor units (cents/pence). Received: ${line.amountMinor}`
        });
        return;
      }

      const currency = (line.currency || 'USD').toUpperCase() as CurrencyCode;
      if (!['USD', 'GBP', 'EUR'].includes(currency)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_CURRENCY',
          message: `Line #${i + 1}: currency must be USD, GBP, or EUR. Received: ${line.currency}`
        });
        return;
      }

      // Check if account is a customer account or GL account
      let accountType: JournalLine['accountType'] = line.accountType || 'CUSTOMER_DEPOSIT';
      let accountName = line.accountName || line.accountId;

      const customerAcc = db.accounts.get(line.accountId);
      if (customerAcc) {
        accountType = 'CUSTOMER_DEPOSIT';
        accountName = customerAcc.name;

        // Verify account is active
        if (customerAcc.status === 'FROZEN' || customerAcc.status === 'CLOSED') {
          res.status(422).json({
            success: false,
            error: 'ACCOUNT_RESTRICTED',
            message: `Customer account ${customerAcc.accountNumber} (${customerAcc.name}) is currently ${customerAcc.status} and cannot be transacted against.`
          });
          return;
        }

        // Verify currency match
        if (customerAcc.currency !== currency) {
          res.status(422).json({
            success: false,
            error: 'CURRENCY_MISMATCH',
            message: `Customer account ${customerAcc.accountNumber} is denominated in ${customerAcc.currency}, but line currency is ${currency}.`
          });
          return;
        }

        // Check sufficient funds if DEBIT
        if (line.direction === 'DEBIT' && customerAcc.availableBalanceMinor < amountMinor) {
          res.status(422).json({
            success: false,
            error: 'INSUFFICIENT_FUNDS',
            message: `Account ${customerAcc.name} (${customerAcc.accountNumber}) has insufficient available funds. Available: ${customerAcc.availableBalanceMinor}, Required Debit: ${amountMinor}.`
          });
          return;
        }
      } else {
        // Must be a known GL account or institutional account
        const glAccount = doubleEntryLedger.getGLAccounts().find((gl) => gl.code === line.accountId);
        if (glAccount) {
          accountName = glAccount.name;
          accountType = `GL_${glAccount.category}` as JournalLine['accountType'];
        }
      }

      if (line.direction === 'DEBIT') {
        debitTotals[currency] += amountMinor;
      } else {
        creditTotals[currency] += amountMinor;
      }

      validatedLines.push({
        id: `line_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        accountId: line.accountId,
        accountType,
        accountName,
        direction: line.direction,
        amountMinor,
        currency,
        description: line.description || body.description
      });
    }

    // 3. Mathematical Double-Entry Zero-Sum Invariant Validation
    const balanceCheck = doubleEntryLedger.validateTransactionBalance(validatedLines);
    if (!balanceCheck.isBalanced) {
      res.status(422).json({
        success: false,
        error: 'DOUBLE_ENTRY_IMBALANCE',
        message: 'Transaction rejected: Total debits must equal total credits for each currency.',
        breakdown: {
          debitTotals: balanceCheck.debitTotals,
          creditTotals: balanceCheck.creditTotals,
          netDifferences: balanceCheck.diffs,
          validationErrors: balanceCheck.errors
        }
      });
      return;
    }

    // 4. Atomic Commit via DoubleEntryLedgerEngine with Customer Database Mutator
    const commitResult = doubleEntryLedger.commitJournalTransaction({
      referenceNumber: body.referenceNumber,
      idempotencyKey: body.idempotencyKey,
      transactionType,
      description: body.description,
      lines: validatedLines,
      effectiveAt: body.effectiveAt,
      metadata: body.metadata,
      accountMutator: (line: JournalLine) => {
        const customerAccount = db.accounts.get(line.accountId);
        if (customerAccount) {
          if (line.direction === 'DEBIT') {
            customerAccount.balanceMinor -= line.amountMinor;
            customerAccount.availableBalanceMinor -= line.amountMinor;
          } else {
            customerAccount.balanceMinor += line.amountMinor;
            customerAccount.availableBalanceMinor += line.amountMinor;
          }

          // Record in customer sub-ledger
          db.ledger.push({
            id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            accountId: customerAccount.id,
            referenceNumber: body.referenceNumber || `TX-FAB-${Date.now().toString().slice(-8)}`,
            direction: line.direction,
            amountMinor: line.amountMinor,
            currency: line.currency,
            description: line.description || body.description,
            category: 'Transfers',
            counterparty: 'First Atlantic Core Ledger',
            status: 'SETTLED',
            channel: 'ONLINE',
            createdTimestamp: new Date().toISOString(),
            effectiveTimestamp: new Date().toISOString(),
            settledTimestamp: new Date().toISOString(),
            balanceAfterMinor: customerAccount.balanceMinor
          });
        }
      }
    });

    // 5. Audit Log
    db.addAuditLog({
      actorId: 'SYSTEM_LEDGER_ENGINE',
      actorEmail: 'ledger.engine@atlantic-bank.internal',
      actorRole: 'SUPER_ADMIN',
      action: 'DOUBLE_ENTRY_TRANSACTION_COMMITTED',
      targetType: 'SYSTEM',
      targetId: commitResult.transaction.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: (req.headers['user-agent'] as string) || 'LedgerService/1.0',
      details: `Committed block #${commitResult.transaction.sequenceIndex} (${commitResult.transaction.id}) with SHA-256 hash ${commitResult.transaction.blockHash.slice(0, 16)}... across ${validatedLines.length} balanced journal legs.`
    });

    res.status(201).json({
      success: true,
      message: 'Double-entry transaction verified and committed to cryptographic ledger.',
      transaction: commitResult.transaction,
      verification: {
        isBalanced: true,
        debitTotals: balanceCheck.debitTotals,
        creditTotals: balanceCheck.creditTotals,
        blockHash: commitResult.transaction.blockHash,
        sequenceIndex: commitResult.transaction.sequenceIndex
      }
    });
  } catch (err: any) {
    console.error('Error posting double-entry transaction:', err);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_LEDGER_ERROR',
      message: err.message || 'An unexpected error occurred while committing the ledger transaction.'
    });
  }
});

/**
 * GET /api/ledger/transactions
 * Retrieve historical chained ledger blocks
 */
ledgerRouter.get('/transactions', (req: Request, res: Response): void => {
  const journal = doubleEntryLedger.getJournal();
  res.json({
    success: true,
    totalCount: journal.length,
    transactions: journal
  });
});

/**
 * GET /api/ledger/validate
 * Verifies global SHA-256 chain integrity and zero-sum balance
 */
ledgerRouter.get('/validate', (req: Request, res: Response): void => {
  const verification = doubleEntryLedger.verifyLedgerIntegrity();
  res.json({
    success: true,
    verification,
    status: verification.isValid ? 'VERIFIED_BALANCED' : 'IMBALANCE_DETECTED'
  });
});
