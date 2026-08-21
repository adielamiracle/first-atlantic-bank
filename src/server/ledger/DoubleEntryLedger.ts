import crypto from 'crypto';
import { CurrencyCode, TransactionDirection } from '../../types';

export type GLAccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface GLAccount {
  code: string;
  name: string;
  category: GLAccountCategory;
  currency: CurrencyCode;
  balanceMinor: number;
  description: string;
}

export interface JournalLine {
  id: string;
  accountId: string; // Customer BankAccount.id OR GLAccount.code
  accountType: 'CUSTOMER_DEPOSIT' | 'GL_ASSET' | 'GL_LIABILITY' | 'GL_EQUITY' | 'GL_REVENUE' | 'GL_EXPENSE';
  accountName: string;
  direction: TransactionDirection; // 'DEBIT' | 'CREDIT'
  amountMinor: number; // Positive integer in cents/pence
  currency: CurrencyCode;
  description: string;
  balanceAfterMinor?: number;
}

export interface JournalTransaction {
  id: string;
  referenceNumber: string;
  idempotencyKey?: string;
  transactionType:
    | 'INTERNAL_TRANSFER'
    | 'OUTBOUND_WIRE'
    | 'INBOUND_WIRE'
    | 'BILL_PAYMENT'
    | 'CHECK_DEPOSIT'
    | 'INTEREST_COMPOUND'
    | 'FEE_ASSESSMENT'
    | 'ADMIN_ADJUSTMENT'
    | 'CARD_SETTLEMENT';
  description: string;
  status: 'COMMITTED' | 'REJECTED';
  lines: JournalLine[];
  metadata?: Record<string, any>;
  createdAt: string;
  effectiveAt: string;
  postedAt: string;
  sequenceIndex: number;
  previousBlockHash: string;
  blockHash: string;
}

export interface LedgerValidationResult {
  isValid: boolean;
  totalTransactions: number;
  totalJournalLines: number;
  totalDebitsMinor: Record<CurrencyCode, number>;
  totalCreditsMinor: Record<CurrencyCode, number>;
  isBalancedPerCurrency: Record<CurrencyCode, boolean>;
  hashChainValid: boolean;
  errors: string[];
  auditedAt: string;
}

/**
 * Enterprise Immutable Double-Entry Ledger Engine
 * Strictly enforces:
 * 1. Every journal transaction must have sum(Debits) == sum(Credits) per currency.
 * 2. Balance mutations only occur after zero-sum validation passes.
 * 3. SHA-256 cryptographic chaining of all transactions (tamper-evident audit trail).
 * 4. Idempotency protection against duplicate financial transactions.
 * 5. Full General Ledger (GL) balance sheet charting alongside customer sub-ledgers.
 */
export class DoubleEntryLedgerEngine {
  private journal: JournalTransaction[] = [];
  private idempotencyStore: Map<string, JournalTransaction> = new Map();
  private glAccounts: Map<string, GLAccount> = new Map();
  private genesisHash: string = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor() {
    this.initializeGeneralLedger();
  }

  /**
   * Initializes the institutional General Ledger Chart of Accounts
   */
  private initializeGeneralLedger() {
    const defaultGLs: GLAccount[] = [
      // Assets (1000s)
      {
        code: 'GL_1001_FED_RESERVE_CASH',
        name: 'Federal Reserve Master Account Cash (USD)',
        category: 'ASSET',
        currency: 'USD',
        balanceMinor: 2500000000, // $25,000,000.00
        description: 'Direct reserve liquidity held at Federal Reserve Bank of New York'
      },
      {
        code: 'GL_1002_BOE_SETTLEMENT_CASH',
        name: 'Bank of England RTGS Reserve Account (GBP)',
        category: 'ASSET',
        currency: 'GBP',
        balanceMinor: 2000000000, // £20,000,000.00
        description: 'Direct settlement liquidity held at the Bank of England'
      },
      {
        code: 'GL_1003_ECB_SETTLEMENT_CASH',
        name: 'ECB TARGET2 Reserve Account (EUR)',
        category: 'ASSET',
        currency: 'EUR',
        balanceMinor: 1500000000, // €15,000,000.00
        description: 'TARGET2 clearing liquidity held at European Central Bank intermediary'
      },
      {
        code: 'GL_1099_FX_CLEARING',
        name: 'Multi-Currency Foreign Exchange Transit Clearing',
        category: 'ASSET',
        currency: 'USD',
        balanceMinor: 0,
        description: 'Intermediary zero-balance account for balancing multi-currency swap legs'
      },

      // Liabilities (2000s)
      {
        code: 'GL_2001_CUSTOMER_DEPOSITS_USD',
        name: 'Customer Demand & Savings Deposit Liabilities (USD)',
        category: 'LIABILITY',
        currency: 'USD',
        balanceMinor: 2500000000,
        description: 'Aggregate customer deposit liabilities in US Dollars'
      },
      {
        code: 'GL_2002_CUSTOMER_DEPOSITS_GBP',
        name: 'Customer Demand & Savings Deposit Liabilities (GBP)',
        category: 'LIABILITY',
        currency: 'GBP',
        balanceMinor: 2000000000,
        description: 'Aggregate customer deposit liabilities in British Pounds'
      },

      // Equity (3000s)
      {
        code: 'GL_3001_TIER1_CAPITAL_RESERVE',
        name: 'Tier-1 Institutional Capital Reserve',
        category: 'EQUITY',
        currency: 'USD',
        balanceMinor: 5000000000, // $50M Tier 1 Capital
        description: 'Core equity capital & retained earnings'
      },

      // Revenues (4000s)
      {
        code: 'GL_4001_WIRE_DISPATCH_FEE_INCOME',
        name: 'Outbound Wire & Payment Network Fee Revenue',
        category: 'REVENUE',
        currency: 'USD',
        balanceMinor: 0,
        description: 'Non-interest revenue from wire processing and SWIFT dispatches'
      },
      {
        code: 'GL_4002_FX_SPREAD_REVENUE',
        name: 'Foreign Exchange Dealer Margin Revenue',
        category: 'REVENUE',
        currency: 'USD',
        balanceMinor: 0,
        description: 'Foreign exchange trading & conversion spread income'
      },

      // Expenses (5000s)
      {
        code: 'GL_5001_DEPOSIT_INTEREST_EXPENSE',
        name: 'High-Yield Savings Compound Interest Expense',
        category: 'EXPENSE',
        currency: 'USD',
        balanceMinor: 0,
        description: 'Interest paid on customer Apex High-Yield deposit products'
      }
    ];

    defaultGLs.forEach((gl) => this.glAccounts.set(gl.code, gl));
  }

  public getGLAccounts(): GLAccount[] {
    return Array.from(this.glAccounts.values());
  }

  public getJournal(): JournalTransaction[] {
    return [...this.journal];
  }

  public getTransactionById(id: string): JournalTransaction | undefined {
    return this.journal.find((t) => t.id === id);
  }

  public getTransactionByIdempotencyKey(key: string): JournalTransaction | undefined {
    return this.idempotencyStore.get(key);
  }

  /**
   * CORE VALIDATION: Verifies that sum(Debits) === sum(Credits) across all currencies in the proposal.
   */
  public validateTransactionBalance(lines: JournalLine[]): {
    isBalanced: boolean;
    debitTotals: Record<CurrencyCode, number>;
    creditTotals: Record<CurrencyCode, number>;
    diffs: Record<CurrencyCode, number>;
    errors: string[];
  } {
    const debitTotals: Record<CurrencyCode, number> = { USD: 0, GBP: 0, EUR: 0 };
    const creditTotals: Record<CurrencyCode, number> = { USD: 0, GBP: 0, EUR: 0 };
    const diffs: Record<CurrencyCode, number> = { USD: 0, GBP: 0, EUR: 0 };
    const errors: string[] = [];

    if (!lines || lines.length < 2) {
      errors.push('A valid double-entry transaction must have at least 2 journal lines.');
      return { isBalanced: false, debitTotals, creditTotals, diffs, errors };
    }

    for (const line of lines) {
      if (line.amountMinor <= 0) {
        errors.push(`Invalid line amount: ${line.amountMinor} for account ${line.accountId}. Must be > 0.`);
      }
      if (!Number.isInteger(line.amountMinor)) {
        errors.push(`Line amount must be an exact integer minor unit. Received: ${line.amountMinor}`);
      }

      if (line.direction === 'DEBIT') {
        debitTotals[line.currency] += line.amountMinor;
      } else if (line.direction === 'CREDIT') {
        creditTotals[line.currency] += line.amountMinor;
      } else {
        errors.push(`Invalid entry direction: ${line.direction}. Must be DEBIT or CREDIT.`);
      }
    }

    let isBalanced = true;
    for (const curr of ['USD', 'GBP', 'EUR'] as CurrencyCode[]) {
      diffs[curr] = debitTotals[curr] - creditTotals[curr];
      if (diffs[curr] !== 0) {
        isBalanced = false;
        errors.push(
          `Imbalance in currency ${curr}: Total Debits (${debitTotals[curr]}) != Total Credits (${creditTotals[curr]}). Net Difference = ${diffs[curr]}`
        );
      }
    }

    return { isBalanced, debitTotals, creditTotals, diffs, errors };
  }

  /**
   * ATOMIC COMMIT: Validates balance and appends immutable chained journal transaction.
   * If unbalanced, throws an Error and aborts before state changes.
   */
  public commitJournalTransaction(params: {
    referenceNumber?: string;
    idempotencyKey?: string;
    transactionType: JournalTransaction['transactionType'];
    description: string;
    lines: JournalLine[];
    effectiveAt?: string;
    metadata?: Record<string, any>;
    accountMutator?: (line: JournalLine) => void;
  }): { success: boolean; transaction: JournalTransaction } {
    // 1. Idempotency Check
    if (params.idempotencyKey && this.idempotencyStore.has(params.idempotencyKey)) {
      const existing = this.idempotencyStore.get(params.idempotencyKey)!;
      return { success: true, transaction: existing };
    }

    // 2. Strict Double-Entry Balance Validation
    const validation = this.validateTransactionBalance(params.lines);
    if (!validation.isBalanced) {
      const errorMsg = `CRITICAL DOUBLE-ENTRY REJECTION: ${validation.errors.join(' | ')}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const txId = `jtx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const ref = params.referenceNumber || `TX-FAB-${Date.now().toString().slice(-8)}`;
    const nowIso = new Date().toISOString();
    const effectiveAt = params.effectiveAt || nowIso;
    const sequenceIndex = this.journal.length;

    const previousBlockHash =
      sequenceIndex > 0 ? this.journal[sequenceIndex - 1].blockHash : this.genesisHash;

    // 3. Compute Cryptographic SHA-256 Hash of Transaction Block
    const payloadToSign = JSON.stringify({
      txId,
      ref,
      type: params.transactionType,
      lines: params.lines.map((l) => ({
        acc: l.accountId,
        dir: l.direction,
        amt: l.amountMinor,
        cur: l.currency
      })),
      effectiveAt,
      previousBlockHash,
      sequenceIndex
    });

    const blockHash = crypto.createHash('sha256').update(payloadToSign).digest('hex');

    // 4. Apply Mutations to Accounts (Only after validation is 100% verified)
    if (params.accountMutator) {
      for (const line of params.lines) {
        params.accountMutator(line);
      }
    }

    // Update GL balances if line references a GL account
    for (const line of params.lines) {
      if (this.glAccounts.has(line.accountId)) {
        const gl = this.glAccounts.get(line.accountId)!;
        // Accounting standard GL balance rules:
        // Asset/Expense: DEBIT increases, CREDIT decreases
        // Liability/Equity/Revenue: CREDIT increases, DEBIT decreases
        if (gl.category === 'ASSET' || gl.category === 'EXPENSE') {
          if (line.direction === 'DEBIT') gl.balanceMinor += line.amountMinor;
          else gl.balanceMinor -= line.amountMinor;
        } else {
          if (line.direction === 'CREDIT') gl.balanceMinor += line.amountMinor;
          else gl.balanceMinor -= line.amountMinor;
        }
      }
    }

    const committedTx: JournalTransaction = {
      id: txId,
      referenceNumber: ref,
      idempotencyKey: params.idempotencyKey,
      transactionType: params.transactionType,
      description: params.description,
      status: 'COMMITTED',
      lines: params.lines,
      metadata: params.metadata,
      createdAt: nowIso,
      effectiveAt,
      postedAt: nowIso,
      sequenceIndex,
      previousBlockHash,
      blockHash
    };

    // 5. Commit to immutable in-memory ledger
    this.journal.push(committedTx);

    if (params.idempotencyKey) {
      this.idempotencyStore.set(params.idempotencyKey, committedTx);
    }

    return { success: true, transaction: committedTx };
  }

  /**
   * AUDIT SUITE: Full cryptographic & mathematical integrity verification.
   * Walks the hash chain and verifies zero-sum per currency across all historical blocks.
   */
  public verifyLedgerIntegrity(): LedgerValidationResult {
    const totalDebitsMinor: Record<CurrencyCode, number> = { USD: 0, GBP: 0, EUR: 0 };
    const totalCreditsMinor: Record<CurrencyCode, number> = { USD: 0, GBP: 0, EUR: 0 };
    const isBalancedPerCurrency: Record<CurrencyCode, boolean> = { USD: true, GBP: true, EUR: true };
    const errors: string[] = [];
    let hashChainValid = true;
    let totalJournalLines = 0;

    let expectedPrevHash = this.genesisHash;

    for (let i = 0; i < this.journal.length; i++) {
      const tx = this.journal[i];
      totalJournalLines += tx.lines.length;

      // 1. Verify Hash Chain Continuity
      if (tx.previousBlockHash !== expectedPrevHash) {
        hashChainValid = false;
        errors.push(
          `Block ${i} (${tx.id}) broken hash chain: Expected prev hash ${expectedPrevHash}, found ${tx.previousBlockHash}`
        );
      }

      // 2. Verify SHA-256 Hash Recalculation
      const payload = JSON.stringify({
        txId: tx.id,
        ref: tx.referenceNumber,
        type: tx.transactionType,
        lines: tx.lines.map((l) => ({
          acc: l.accountId,
          dir: l.direction,
          amt: l.amountMinor,
          cur: l.currency
        })),
        effectiveAt: tx.effectiveAt,
        previousBlockHash: tx.previousBlockHash,
        sequenceIndex: tx.sequenceIndex
      });
      const calculatedHash = crypto.createHash('sha256').update(payload).digest('hex');
      if (calculatedHash !== tx.blockHash) {
        hashChainValid = false;
        errors.push(`Block ${i} (${tx.id}) payload hash mismatch: Tampering detected.`);
      }

      expectedPrevHash = tx.blockHash;

      // 3. Verify Transaction Level Double-Entry Balance
      const txValidation = this.validateTransactionBalance(tx.lines);
      if (!txValidation.isBalanced) {
        errors.push(`Transaction ${tx.id} has unbalanced lines: ${txValidation.errors.join(', ')}`);
      }

      // Aggregate cumulative debits/credits
      for (const line of tx.lines) {
        if (line.direction === 'DEBIT') {
          totalDebitsMinor[line.currency] += line.amountMinor;
        } else {
          totalCreditsMinor[line.currency] += line.amountMinor;
        }
      }
    }

    for (const curr of ['USD', 'GBP', 'EUR'] as CurrencyCode[]) {
      if (totalDebitsMinor[curr] !== totalCreditsMinor[curr]) {
        isBalancedPerCurrency[curr] = false;
        errors.push(
          `Global ledger imbalance in ${curr}: Total Debits = ${totalDebitsMinor[curr]}, Total Credits = ${totalCreditsMinor[curr]}`
        );
      }
    }

    const isValid = hashChainValid && errors.length === 0;

    return {
      isValid,
      totalTransactions: this.journal.length,
      totalJournalLines,
      totalDebitsMinor,
      totalCreditsMinor,
      isBalancedPerCurrency,
      hashChainValid,
      errors,
      auditedAt: new Date().toISOString()
    };
  }
}

// Global Singleton Instance
export const doubleEntryLedger = new DoubleEntryLedgerEngine();
