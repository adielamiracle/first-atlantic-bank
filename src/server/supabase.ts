import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const sbUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const sbKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

export const isServerSupabaseConfigured = Boolean(
  sbUrl &&
  sbKey &&
  sbUrl.startsWith('https://') &&
  sbUrl.includes('.supabase.co') &&
  !sbUrl.includes('first-atlantic-bank.supabase.co') &&
  !sbKey.includes('mock_signature_key') &&
  sbKey.length > 20
);

let serverSupabaseClient: SupabaseClient | null = null;

if (isServerSupabaseConfigured) {
  try {
    serverSupabaseClient = createClient(sbUrl, sbKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.info('[First Atlantic Bank] Supabase Cloud Gateway Connected:', sbUrl);
  } catch (e) {
    console.warn('[First Atlantic Bank] Supabase initialization notice:', e);
    serverSupabaseClient = null;
  }
}

export function getServerSupabase(): SupabaseClient | null {
  return serverSupabaseClient;
}

/**
 * Non-blocking safe sync to any Supabase table
 */
export async function syncRecordToSupabase(tableName: string, record: any): Promise<boolean> {
  if (!serverSupabaseClient || !record) return false;
  try {
    const item = Array.isArray(record) ? record : [record];
    const { error } = await serverSupabaseClient
      .from(tableName)
      .upsert(item, { onConflict: 'id' });

    if (error) {
      console.debug(`[Supabase Table Sync ${tableName}]:`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.debug(`[Supabase Sync Catch ${tableName}]:`, err?.message || err);
    return false;
  }
}

/**
 * Upload a file or base64 image directly to Supabase Storage and files table
 */
export async function uploadFileToSupabase(
  payload: string | Buffer,
  fileName: string,
  contentType: string = 'image/jpeg',
  userId?: string
): Promise<{ success: boolean; url: string; fileId: string }> {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let buffer: Buffer;
  let base64String: string = '';

  if (typeof payload === 'string') {
    if (payload.startsWith('data:')) {
      const match = payload.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        contentType = match[1] || contentType;
        base64String = payload;
        buffer = Buffer.from(match[2], 'base64');
      } else {
        buffer = Buffer.from(payload);
        base64String = payload;
      }
    } else {
      buffer = Buffer.from(payload);
      base64String = payload;
    }
  } else {
    buffer = payload;
    base64String = `data:${contentType};base64,` + buffer.toString('base64');
  }

  let finalUrl = '';

  // 1. If Supabase Client is connected, upload to Supabase Storage bucket 'uploads' or 'documents'
  if (serverSupabaseClient) {
    try {
      const storagePath = `${userId || 'general'}/${Date.now()}_${fileName}`;
      const { data: uploadData, error: uploadError } = await serverSupabaseClient
        .storage
        .from('uploads')
        .upload(storagePath, buffer, {
          contentType,
          upsert: true
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = serverSupabaseClient.storage.from('uploads').getPublicUrl(storagePath);
        finalUrl = publicUrlData?.publicUrl || '';
      }
    } catch (storageErr) {
      console.debug('[Supabase Storage Upload Notice]:', storageErr);
    }

    // 2. Also persist file metadata & base64 into Supabase `files` table
    try {
      await syncRecordToSupabase('files', {
        id: fileId,
        user_id: userId || 'system',
        file_name: fileName,
        file_url: finalUrl,
        content_type: contentType,
        file_size: buffer.length,
        data_base64: base64String.length < 2000000 ? base64String : null, // Store if < 2MB
        created_at: new Date().toISOString()
      });
    } catch (fileTableErr) {
      console.debug('[Supabase Files Table Sync Notice]:', fileTableErr);
    }
  }

  // 3. Also persist to local disk as reliable dual-redundancy
  try {
    const dataUploadsDir = path.join(process.cwd(), 'data', 'uploads');
    if (!fs.existsSync(dataUploadsDir)) {
      fs.mkdirSync(dataUploadsDir, { recursive: true });
    }
    const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(publicUploadsDir)) {
      fs.mkdirSync(publicUploadsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(dataUploadsDir, fileName), buffer);
    fs.writeFileSync(path.join(publicUploadsDir, fileName), buffer);

    if (!finalUrl) {
      finalUrl = `/uploads/${fileName}`;
    }
  } catch (diskErr) {
    console.debug('[Local Disk Upload Notice]:', diskErr);
  }

  return {
    success: true,
    url: finalUrl || `/uploads/${fileName}`,
    fileId
  };
}

/**
 * Sync individual User to Supabase
 */
export async function syncUserToSupabase(user: any) {
  if (!user || !serverSupabaseClient) return;
  return syncRecordToSupabase('users', {
    id: user.id,
    email: user.email,
    username: user.username,
    first_name: user.firstName || user.first_name || '',
    last_name: user.lastName || user.last_name || '',
    phone: user.phone || '',
    dial_code: user.dialCode || '+1',
    date_of_birth: user.dateOfBirth || '',
    nationality: user.nationality || '',
    passport_number: user.passportNumber || '',
    passport_photo: user.passportPhoto || '',
    login_pin: user.loginPin || '1234',
    ssn_masked: user.ssnMasked || '',
    national_insurance_masked: user.nationalInsuranceMasked || '',
    region: user.region || 'US',
    approval_status: user.approval_status || 'APPROVED',
    kyc_tier: user.kycTier || 'TIER_2_VERIFIED_PREMIER',
    security_score: user.securityScore || 95,
    address: user.address || {},
    profile_data: user,
    updated_at: new Date().toISOString()
  });
}

/**
 * Sync individual Account to Supabase
 */
export async function syncAccountToSupabase(acc: any) {
  if (!acc || !serverSupabaseClient) return;
  return syncRecordToSupabase('accounts', {
    id: acc.id,
    user_id: acc.userId || acc.user_id,
    account_number: acc.accountNumber || acc.account_number,
    account_number_full: acc.accountNumberFull || acc.account_number_full || '',
    routing_number: acc.routingNumber || acc.routing_number || '',
    sort_code: acc.sortCode || acc.sort_code || '',
    iban: acc.iban || '',
    swift_bic: acc.swiftBic || acc.swift_bic || 'FATLUS33NYC',
    name: acc.name,
    type: acc.type,
    currency: acc.currency,
    balance_minor: acc.balanceMinor !== undefined ? acc.balanceMinor : acc.balance_minor || 0,
    available_balance_minor: acc.availableBalanceMinor !== undefined ? acc.availableBalanceMinor : acc.available_balance_minor || 0,
    pending_hold_minor: acc.pendingHoldMinor || acc.pending_hold_minor || 0,
    interest_rate_apy: acc.interestRateAPY || acc.interest_rate_apy || 0.0,
    status: acc.status || 'ACTIVE',
    region: acc.region || 'US',
    opened_date: acc.openedDate || acc.opened_date || new Date().toISOString().split('T')[0],
    daily_transfer_limit_minor: acc.dailyTransferLimitMinor || acc.daily_transfer_limit_minor || 50000000,
    statement_cycle_day: acc.statementCycleDay || acc.statement_cycle_day || 28,
    account_data: acc,
    updated_at: new Date().toISOString()
  });
}

/**
 * Sync individual Card to Supabase
 */
export async function syncCardToSupabase(card: any) {
  if (!card || !serverSupabaseClient) return;
  return syncRecordToSupabase('cards', {
    id: card.id,
    account_id: card.accountId || card.account_id,
    user_id: card.userId || card.user_id,
    card_number_masked: card.cardNumberMasked || card.card_number_masked,
    card_number_full: card.cardNumberFull || card.card_number_full || '',
    card_holder_name: card.cardHolderName || card.card_holder_name,
    expiry_month: card.expiryMonth || card.expiry_month,
    expiry_year: card.expiryYear || card.expiry_year,
    cvv: card.cvv || '',
    card_type: card.cardType || card.card_type || 'DEBIT_VISA_SIGNATURE',
    status: card.status || 'ACTIVE',
    is_virtual: Boolean(card.isVirtual || card.is_virtual),
    card_data: card,
    updated_at: new Date().toISOString()
  });
}

/**
 * Sync individual Ledger Transaction to Supabase
 */
export async function syncLedgerEntryToSupabase(entry: any) {
  if (!entry || !serverSupabaseClient) return;
  return syncRecordToSupabase('transactions', {
    id: entry.id,
    transaction_id: entry.transactionId || entry.transaction_id || entry.id,
    account_id: entry.accountId || entry.account_id,
    user_id: entry.userId || entry.user_id || '',
    direction: entry.direction,
    amount_minor: entry.amountMinor !== undefined ? entry.amountMinor : entry.amount_minor,
    currency: entry.currency,
    balance_after_minor: entry.balanceAfterMinor !== undefined ? entry.balanceAfterMinor : entry.balance_after_minor || 0,
    description: entry.description,
    category: entry.category,
    counterparty: entry.counterparty || '',
    status: entry.status || 'SETTLED',
    channel: entry.channel || 'ONLINE',
    reference_number: entry.referenceNumber || entry.reference_number || '',
    created_timestamp: entry.createdTimestamp || entry.created_timestamp || new Date().toISOString(),
    effective_timestamp: entry.effectiveTimestamp || entry.effective_timestamp || new Date().toISOString(),
    metadata: entry.metadata || entry
  });
}

/**
 * Sync individual Application to Supabase
 */
export async function syncApplicationToSupabase(app: any) {
  if (!app || !serverSupabaseClient) return;
  return syncRecordToSupabase('applications', {
    id: app.id,
    reference_number: app.referenceNumber || app.reference_number,
    first_name: app.firstName || app.first_name,
    last_name: app.lastName || app.last_name,
    email: app.email,
    phone: app.phone || '',
    region: app.requestedRegion || app.region || 'US',
    currency: app.requestedCurrency || app.currency || 'USD',
    status: app.status || 'PENDING',
    submitted_at: app.submittedAt || app.submitted_at || new Date().toISOString(),
    reviewed_at: app.reviewedAt || app.reviewed_at || null,
    reviewed_by_admin_id: app.reviewedByAdminId || app.reviewed_by_admin_id || null,
    reviewed_by_admin_name: app.reviewedByAdminName || app.reviewed_by_admin_name || null,
    created_user_id: app.createdUserId || app.created_user_id || null,
    provisioned_account_number: app.provisionedAccountNumber || app.provisioned_account_number || null,
    provisioned_routing_number: app.provisionedRoutingNumber || app.provisioned_routing_number || null,
    data: app
  });
}

/**
 * Helper to sync full user and application dossier to Supabase if connected
 */
export async function syncNewRegistrationToSupabase(user: any, application: any, accounts: any[] = []) {
  if (!serverSupabaseClient) return;
  try {
    if (application) await syncApplicationToSupabase(application);
    if (user) await syncUserToSupabase(user);
    if (Array.isArray(accounts)) {
      for (const acc of accounts) {
        await syncAccountToSupabase(acc);
      }
    }
  } catch (e) {
    console.debug('[Supabase Sync Background Notice]:', e);
  }
}

/**
 * Sync entire in-memory bank database to Supabase Cloud
 */
export async function syncAllDataToSupabase(db: any): Promise<{ success: boolean; syncedCounts: Record<string, number> }> {
  if (!serverSupabaseClient) {
    return { success: false, syncedCounts: {} };
  }

  const counts: Record<string, number> = {
    users: 0,
    accounts: 0,
    cards: 0,
    transactions: 0,
    applications: 0,
    auditLogs: 0,
    supportCases: 0,
    adjustments: 0
  };

  try {
    // 1. Users
    for (const user of db.users.values()) {
      const ok = await syncUserToSupabase(user);
      if (ok) counts.users++;
    }

    // 2. Accounts
    for (const acc of db.accounts.values()) {
      const ok = await syncAccountToSupabase(acc);
      if (ok) counts.accounts++;
    }

    // 3. Cards
    for (const card of db.cards.values()) {
      const ok = await syncCardToSupabase(card);
      if (ok) counts.cards++;
    }

    // 4. Transactions / Ledger
    for (const entry of db.ledger) {
      const ok = await syncLedgerEntryToSupabase(entry);
      if (ok) counts.transactions++;
    }

    // 5. Applications
    for (const app of db.applications.values()) {
      const ok = await syncApplicationToSupabase(app);
      if (ok) counts.applications++;
    }

    // 6. Audit Logs
    for (const log of db.auditLogs) {
      const ok = await syncRecordToSupabase('audit_logs', {
        id: log.id,
        actor_id: log.actorId,
        actor_name: log.actorName,
        action: log.action,
        target_type: log.targetType,
        target_id: log.targetId,
        timestamp: log.timestamp,
        data: log
      });
      if (ok) counts.auditLogs++;
    }

    // 7. Support Cases
    for (const sc of db.supportCases) {
      const ok = await syncRecordToSupabase('support_cases', {
        id: sc.id,
        user_id: sc.userId,
        subject: sc.subject,
        category: sc.category,
        priority: sc.priority,
        status: sc.status,
        created_at: sc.createdAt,
        data: sc
      });
      if (ok) counts.supportCases++;
    }

    // 8. Financial Adjustments
    for (const adj of db.adjustments) {
      const ok = await syncRecordToSupabase('financial_adjustments', {
        id: adj.id,
        account_id: adj.accountId,
        user_id: adj.userId,
        amount_minor: adj.amountMinor,
        reason: adj.reason,
        admin_id: adj.adminId,
        created_at: adj.timestamp,
        data: adj
      });
      if (ok) counts.adjustments++;
    }

    return { success: true, syncedCounts: counts };
  } catch (err) {
    console.error('[Supabase Sync All Error]:', err);
    return { success: false, syncedCounts: counts };
  }
}

/**
 * Load and hydrate in-memory database from Supabase tables on startup
 */
export async function loadDataFromSupabase(db: any): Promise<boolean> {
  if (!serverSupabaseClient) return false;

  try {
    // 1. Fetch Users
    const { data: usersData } = await serverSupabaseClient.from('users').select('*');
    if (usersData && usersData.length > 0) {
      for (const row of usersData) {
        const fullUser = row.profile_data || {
          id: row.id,
          email: row.email,
          username: row.username,
          firstName: row.first_name,
          lastName: row.last_name,
          phone: row.phone,
          dialCode: row.dial_code || '+1',
          dateOfBirth: row.date_of_birth || '1988-06-15',
          nationality: row.nationality || 'American',
          passportNumber: row.passport_number,
          passportPhoto: row.passport_photo,
          loginPin: row.login_pin || '1234',
          ssnMasked: row.ssn_masked || '•••-••-8899',
          region: row.region || 'US',
          approval_status: row.approval_status || 'APPROVED',
          address: row.address || {},
          kycTier: row.kyc_tier || 'TIER_2_VERIFIED_PREMIER',
          securityScore: row.security_score || 95,
          notifications: {
            emailAlerts: true,
            smsAlerts: true,
            pushAlerts: true,
            largeTransactionThresholdMinor: 500000
          },
          lastLogin: new Date().toISOString()
        };
        db.users.set(row.id, fullUser);
        db.userPasswords.set(row.id, 'AtlanticSecure2026!');
      }
    }

    // 2. Fetch Accounts
    const { data: accountsData } = await serverSupabaseClient.from('accounts').select('*');
    if (accountsData && accountsData.length > 0) {
      for (const row of accountsData) {
        const fullAcc = row.account_data || {
          id: row.id,
          userId: row.user_id,
          accountNumber: row.account_number,
          accountNumberFull: row.account_number_full || row.account_number,
          routingNumber: row.routing_number || '021000089',
          sortCode: row.sort_code || '40-12-88',
          iban: row.iban,
          swiftBic: row.swift_bic || 'FATLUS33NYC',
          name: row.name,
          type: row.type || 'CHECKING_PREMIER',
          currency: row.currency || 'USD',
          balanceMinor: Number(row.balance_minor || 0),
          availableBalanceMinor: Number(row.available_balance_minor || row.balance_minor || 0),
          pendingHoldMinor: Number(row.pending_hold_minor || 0),
          interestRateAPY: Number(row.interest_rate_apy || 0.0),
          status: row.status || 'ACTIVE',
          region: row.region || 'US',
          openedDate: row.opened_date || new Date().toISOString().split('T')[0],
          dailyTransferLimitMinor: Number(row.daily_transfer_limit_minor || 50000000),
          statementCycleDay: Number(row.statement_cycle_day || 28)
        };
        db.accounts.set(row.id, fullAcc);
      }
    }

    // 3. Fetch Cards
    const { data: cardsData } = await serverSupabaseClient.from('cards').select('*');
    if (cardsData && cardsData.length > 0) {
      for (const row of cardsData) {
        const fullCard = row.card_data || {
          id: row.id,
          accountId: row.account_id,
          userId: row.user_id,
          cardNumberMasked: row.card_number_masked,
          cardNumberFull: row.card_number_full || '4111 0000 0000 0000',
          cardHolderName: row.card_holder_name || 'CLIENT',
          expiryMonth: row.expiry_month || 12,
          expiryYear: row.expiry_year || 2031,
          cvv: row.cvv || '123',
          cardType: row.card_type || 'DEBIT_VISA_SIGNATURE',
          status: row.status || 'ACTIVE',
          isVirtual: Boolean(row.is_virtual),
          contactlessEnabled: true,
          onlineTransactionsEnabled: true,
          internationalSpendEnabled: true,
          dailyAtmLimitMinor: 500000,
          dailySpendLimitMinor: 2500000,
          travelNotices: []
        };
        db.cards.set(row.id, fullCard);
      }
    }

    // 4. Fetch Applications
    const { data: appsData } = await serverSupabaseClient.from('applications').select('*');
    if (appsData && appsData.length > 0) {
      for (const row of appsData) {
        const fullApp = row.data || {
          id: row.id,
          referenceNumber: row.reference_number,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
          requestedRegion: row.region,
          requestedCurrency: row.currency,
          status: row.status,
          submittedAt: row.submitted_at
        };
        db.applications.set(row.id, fullApp);
      }
    }

    // 5. Fetch Transactions
    const { data: txnsData } = await serverSupabaseClient.from('transactions').select('*');
    if (txnsData && txnsData.length > 0) {
      for (const row of txnsData) {
        if (!db.ledger.some((e: any) => e.id === row.id)) {
          db.ledger.push(row.metadata || {
            id: row.id,
            transactionId: row.transaction_id || row.id,
            accountId: row.account_id,
            direction: row.direction || 'CREDIT',
            amountMinor: Number(row.amount_minor || 0),
            currency: row.currency || 'USD',
            balanceAfterMinor: Number(row.balance_after_minor || 0),
            description: row.description || 'Transaction',
            category: row.category || 'Transfers',
            counterparty: row.counterparty || 'External',
            status: row.status || 'SETTLED',
            channel: row.channel || 'ONLINE',
            referenceNumber: row.reference_number || `REF-${Date.now()}`,
            createdTimestamp: row.created_timestamp || new Date().toISOString(),
            effectiveTimestamp: row.effective_timestamp || new Date().toISOString()
          });
        }
      }
    }

    console.info(`[First Atlantic Bank] Hydrated state from Supabase: ${usersData?.length || 0} users, ${accountsData?.length || 0} accounts, ${txnsData?.length || 0} transactions.`);
    return true;
  } catch (err) {
    console.warn('[Supabase Initial Hydration Notice]:', err);
    return false;
  }
}
