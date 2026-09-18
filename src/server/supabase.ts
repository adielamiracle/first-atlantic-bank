import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export function isValidSupabaseKey(key?: string | null): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (trimmed.length < 20) return false;
  // Reject keys with non-ASCII characters (e.g. Unicode bullet points like • char code 8226 / > 127)
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed.charCodeAt(i) > 127) {
      return false;
    }
  }
  // Reject placeholder or masked keys
  if (
    trimmed.includes('••••') ||
    trimmed.includes('****') ||
    trimmed.includes('mock_signature_key') ||
    trimmed.includes('your-supabase-key') ||
    trimmed.includes('placeholder')
  ) {
    return false;
  }
  // Standard valid JWT base64url or API key token format
  if (!/^[A-Za-z0-9_\-\.]+$/.test(trimmed)) {
    return false;
  }

  // If key is a JWT (has 3 dot-separated parts), inspect payload to prevent "JWT issued at future"
  if (trimmed.includes('.')) {
    const parts = trimmed.split('.');
    if (parts.length === 3) {
      try {
        const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(payloadStr);
        const nowSec = Math.floor(Date.now() / 1000);
        // If JWT iat is in the future relative to server clock, reject it to avoid "JWT issued at future"
        if (payload.iat && payload.iat > nowSec + 30) {
          return false;
        }
      } catch {
        return false;
      }
    }
  }

  return true;
}

export function isValidSupabaseUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://localhost')) return false;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed.charCodeAt(i) > 127) {
      return false;
    }
  }
  if (
    trimmed.includes('••••') ||
    trimmed.includes('****') ||
    trimmed.includes('first-atlantic-bank.supabase.co') ||
    trimmed.includes('your-project-id.supabase.co') ||
    trimmed.includes('placeholder')
  ) {
    return false;
  }
  return true;
}

const candidateUrls = [
  process.env.SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_URL
];
const sbUrl = (candidateUrls.find(u => isValidSupabaseUrl(u)) || '').trim();

// Prioritize secret role keys (sb_secret_...) as they bypass RLS, don't expire, and are not affected by JWT clock skew
const candidateKeys = [
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  process.env.VITE_SUPABASE_ANON_KEY,
  process.env.SUPABASE_ANON_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
];

const validKeys = candidateKeys
  .map(k => (k || '').trim())
  .filter(k => isValidSupabaseKey(k));

// Prioritize native non-JWT secret keys, then publishable keys, then valid non-future JWT keys
const sbKey = (
  validKeys.find(k => k.startsWith('sb_secret_')) ||
  validKeys.find(k => !k.includes('.')) ||
  validKeys[0] ||
  ''
).trim();

export const isServerSupabaseConfigured = Boolean(
  isValidSupabaseUrl(sbUrl) && isValidSupabaseKey(sbKey)
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
  if (!serverSupabaseClient && isServerSupabaseConfigured) {
    try {
      serverSupabaseClient = createClient(sbUrl, sbKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    } catch {}
  }
  return serverSupabaseClient;
}

// In-memory schema cache mapping table names to their valid column names
let tableSchemaCache: Record<string, Set<string>> | null = null;
let schemaFetchPromise: Promise<Record<string, Set<string>> | null> | null = null;

/**
 * Discovers and caches available table definitions from Supabase OpenAPI schema
 */
export async function getTableSchema(tableName: string): Promise<Set<string> | null> {
  if (tableSchemaCache) {
    return tableSchemaCache[tableName] || null;
  }
  if (!schemaFetchPromise && isServerSupabaseConfigured) {
    schemaFetchPromise = (async () => {
      try {
        const fetchUrl = `${sbUrl}/rest/v1/?apikey=${sbKey}`;
        const resp = await fetch(fetchUrl, {
          headers: {
            apikey: sbKey,
            Authorization: `Bearer ${sbKey}`
          }
        });
        if (resp.ok) {
          const spec: any = await resp.json();
          const map: Record<string, Set<string>> = {};
          for (const [tName, def] of Object.entries(spec.definitions || {})) {
            const props = (def as any)?.properties || {};
            map[tName] = new Set(Object.keys(props));
          }
          tableSchemaCache = map;
          return map;
        }
      } catch (err) {
        // Non-blocking schema fetch failure
      }
      return null;
    })();
  }
  const fullCache = await schemaFetchPromise;
  return fullCache ? fullCache[tableName] || null : null;
}

/**
 * Non-blocking safe sync to any Supabase table with dynamic schema column filtering
 */
export async function syncRecordToSupabase(tableName: string, record: any): Promise<boolean> {
  if (!serverSupabaseClient || !record) return false;
  try {
    const validColumns = await getTableSchema(tableName);
    // If the schema cache is loaded and this table does not exist in Supabase, safely skip without error
    if (tableSchemaCache && !tableSchemaCache[tableName]) {
      return false;
    }

    const items = Array.isArray(record) ? record : [record];
    // Filter each item's properties to only valid columns present in the schema cache
    const sanitizedItems = items.map(item => {
      if (!validColumns || validColumns.size === 0) return item;
      const clean: Record<string, any> = {};
      for (const [k, v] of Object.entries(item)) {
        if (validColumns.has(k)) {
          clean[k] = v;
        }
      }
      return clean;
    });

    if (sanitizedItems.length === 0 || Object.keys(sanitizedItems[0]).length === 0) {
      return false;
    }

    const { error } = await serverSupabaseClient
      .from(tableName)
      .upsert(sanitizedItems, { onConflict: 'id' });

    if (error) {
      // Suppress noisy benign logs for schema differences, missing columns, or timing issues
      if (
        error.message?.includes('schema cache') ||
        error.message?.includes('JWT issued at future') ||
        error.message?.includes('violates foreign key constraint')
      ) {
        return false;
      }
      console.debug(`[Supabase Table Sync ${tableName}]:`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
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
 * Sync individual User to Supabase with adaptive dual-schema resilience
 */
export async function syncUserToSupabase(user: any): Promise<boolean> {
  if (!user || !serverSupabaseClient) return false;

  try {
    const validColumns = await getTableSchema('users');
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.fullName || user.username || user.email;

    // 1. Check if user already exists in Supabase by email or id
    const orCondition = user.email ? (user.id ? `id.eq.${user.id},email.eq.${user.email}` : `email.eq.${user.email}`) : `id.eq.${user.id}`;
    const { data: existing } = await serverSupabaseClient
      .from('users')
      .select('id, email')
      .or(orCondition)
      .limit(1);

    if (existing && existing.length > 0) {
      // Build update payload containing ONLY columns that exist in the Supabase schema
      const updatePayload: Record<string, any> = {};
      const candidateFields: Record<string, any> = {
        full_name: fullName,
        profile_image_url: user.passportPhoto || user.profileImageUrl || null,
        role: user.role === 'admin' ? 'admin' : 'user'
      };

      for (const [k, v] of Object.entries(candidateFields)) {
        if (!validColumns || validColumns.has(k)) {
          updatePayload[k] = v;
        }
      }

      // If schema supports additional columns, safely include them
      if (validColumns) {
        if (validColumns.has('phone') && user.phone) updatePayload.phone = user.phone;
        if (validColumns.has('region') && user.region) updatePayload.region = user.region;
        if (validColumns.has('status') && user.approval_status) updatePayload.status = user.approval_status;
        if (validColumns.has('address') && user.address) updatePayload.address = user.address;
        if (validColumns.has('updated_at')) updatePayload.updated_at = new Date().toISOString();
      }

      const { error: updateErr } = await serverSupabaseClient
        .from('users')
        .update(updatePayload)
        .eq('id', existing[0].id);

      if (!updateErr) return true;
    } else {
      // User does not exist in Supabase yet.
      // Supabase public.users requires a foreign key into auth.users.id (must be valid UUID).
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id || '');
      if (isUuid) {
        const insertPayload: Record<string, any> = {
          id: user.id,
          email: user.email,
          full_name: fullName,
          profile_image_url: user.passportPhoto || null,
          role: user.role === 'admin' ? 'admin' : 'user'
        };
        // Strip any keys not in schema
        const filteredPayload: Record<string, any> = {};
        for (const [k, v] of Object.entries(insertPayload)) {
          if (!validColumns || validColumns.has(k)) {
            filteredPayload[k] = v;
          }
        }
        const { error: insertErr } = await serverSupabaseClient
          .from('users')
          .insert([filteredPayload]);
        if (!insertErr) return true;
      }
    }
  } catch (err: any) {
    // Non-blocking sync notice
  }

  return false;
}

/**
 * Sync individual Account to Supabase with adaptive dual-schema resilience
 */
export async function syncAccountToSupabase(acc: any): Promise<boolean> {
  if (!acc || !serverSupabaseClient) return false;

  try {
    const validColumns = await getTableSchema('accounts');
    const rawBalMinor = acc.balanceMinor !== undefined ? acc.balanceMinor : (acc.balance_minor || 0);
    const balanceDollars = Number((rawBalMinor / 100).toFixed(2));
    const accNum = acc.accountNumber || acc.account_number;

    // 1. Locate existing account record in Supabase
    const orClause = accNum ? (acc.id ? `id.eq.${acc.id},account_number.eq.${accNum}` : `account_number.eq.${accNum}`) : `id.eq.${acc.id}`;
    const { data: existing } = await serverSupabaseClient
      .from('accounts')
      .select('id, user_id, account_number')
      .or(orClause)
      .limit(1);

    if (existing && existing.length > 0) {
      const updatePayload: Record<string, any> = {};
      const candidateFields: Record<string, any> = {
        account_name: acc.name || acc.accountName || 'Primary Account',
        balance: balanceDollars,
        currency: acc.currency || 'USD',
        account_type: acc.type === 'SAVINGS_HIGH_YIELD' ? 'Savings' : 'Checking',
        status: (acc.status || 'ACTIVE').toUpperCase()
      };

      for (const [k, v] of Object.entries(candidateFields)) {
        if (!validColumns || validColumns.has(k)) {
          updatePayload[k] = v;
        }
      }

      if (validColumns) {
        if (validColumns.has('balance_minor')) updatePayload.balance_minor = rawBalMinor;
        if (validColumns.has('available_balance')) updatePayload.available_balance = balanceDollars;
        if (validColumns.has('available_balance_minor')) updatePayload.available_balance_minor = rawBalMinor;
        if (validColumns.has('updated_at')) updatePayload.updated_at = new Date().toISOString();
      }

      const { error: updateErr } = await serverSupabaseClient
        .from('accounts')
        .update(updatePayload)
        .eq('id', existing[0].id);

      if (!updateErr) return true;
    } else {
      // If account does not exist in Supabase and id is a UUID, attempt insert
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acc.id || '');
      const isUserUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acc.userId || acc.user_id || '');
      if (isUuid && isUserUuid) {
        const insertPayload: Record<string, any> = {
          id: acc.id,
          user_id: acc.userId || acc.user_id,
          account_number: accNum,
          account_name: acc.name || acc.accountName || 'Primary Account',
          balance: balanceDollars,
          currency: acc.currency || 'USD',
          account_type: acc.type === 'SAVINGS_HIGH_YIELD' ? 'Savings' : 'Checking',
          status: (acc.status || 'ACTIVE').toUpperCase()
        };
        const filteredPayload: Record<string, any> = {};
        for (const [k, v] of Object.entries(insertPayload)) {
          if (!validColumns || validColumns.has(k)) {
            filteredPayload[k] = v;
          }
        }
        const { error: insertErr } = await serverSupabaseClient
          .from('accounts')
          .insert([filteredPayload]);
        if (!insertErr) return true;
      }
    }
  } catch (fallbackErr) {
    // Non-blocking sync notice
  }

  return false;
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
 * Sync Beneficiary to Supabase
 */
export async function syncBeneficiaryToSupabase(beneficiary: any) {
  if (!beneficiary || !serverSupabaseClient) return;
  return syncRecordToSupabase('beneficiaries', {
    id: beneficiary.id,
    user_id: beneficiary.user_id || beneficiary.userId || null,
    name: beneficiary.name,
    account: beneficiary.account || beneficiary.account_number,
    bank: beneficiary.bank || beneficiary.bank_name || 'Destination Bank',
    avatar_url: beneficiary.avatar_url || beneficiary.avatarUrl || null,
    created_at: beneficiary.created_at || new Date().toISOString(),
    metadata: beneficiary
  });
}

/**
 * Sync Notification to Supabase
 */
export async function syncNotificationToSupabase(notif: any) {
  if (!notif || !serverSupabaseClient) return;
  return syncRecordToSupabase('notifications', {
    id: notif.id,
    user_id: notif.userId || notif.user_id,
    title: notif.title || 'Bank Alert',
    message: notif.message,
    type: notif.type || 'SYSTEM',
    is_read: Boolean(notif.isRead || notif.read),
    created_at: notif.createdTimestamp || notif.created_at || new Date().toISOString(),
    metadata: notif
  });
}

/**
 * Sync Activation Request to Supabase
 */
export async function syncActivationRequestToSupabase(req: any) {
  if (!req || !serverSupabaseClient) return;
  return syncRecordToSupabase('activation_requests', {
    id: req.id,
    user_id: req.userId || req.user_id,
    account_id: req.accountId || req.account_id,
    requested_at: req.requestedAt || req.requested_at || new Date().toISOString(),
    status: req.status || 'PENDING',
    notes: req.notes || '',
    data: req
  });
}

/**
 * Sync Treasury Receiving Account to Supabase
 */
export async function syncReceivingAccountToSupabase(acc: any) {
  if (!acc || !serverSupabaseClient) return;
  return syncRecordToSupabase('receiving_accounts', {
    id: acc.id,
    bank_name: acc.bankName || acc.bank_name,
    account_name: acc.accountName || acc.account_name,
    account_number: acc.accountNumber || acc.account_number,
    routing_number: acc.routingNumber || acc.routing_number || '',
    swift_bic: acc.swiftBic || acc.swift_bic || '',
    iban: acc.iban || '',
    currency: acc.currency || 'USD',
    region: acc.region || 'US',
    status: acc.status || 'ACTIVE',
    instructions: acc.instructions || '',
    created_at: acc.createdAt || acc.created_at || new Date().toISOString(),
    data: acc
  });
}

/**
 * Sync Wise Transfer to Supabase
 */
export async function syncWiseTransferToSupabase(transfer: any) {
  if (!transfer || !serverSupabaseClient) return;
  return syncRecordToSupabase('wise_transfers', {
    id: transfer.id,
    user_id: transfer.userId || transfer.user_id,
    user_name: transfer.userName || transfer.user_name || '',
    source_account_id: transfer.sourceAccountId || transfer.source_account_id,
    amount_minor: transfer.amountMinor || transfer.amount_minor || 0,
    source_currency: transfer.sourceCurrency || 'USD',
    dest_currency: transfer.destCurrency || 'USD',
    recipient: transfer.recipient || {},
    status: transfer.status || 'COMPLETED',
    wise_status: transfer.wiseStatus || 'outgoing_payment_sent',
    reference: transfer.reference || '',
    memo: transfer.memo || '',
    created_at: transfer.createdTimestamp || new Date().toISOString(),
    updated_at: transfer.updatedTimestamp || new Date().toISOString(),
    data: transfer
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
    beneficiaries: 0,
    notifications: 0,
    applications: 0,
    activationRequests: 0,
    receivingAccounts: 0,
    auditLogs: 0,
    supportCases: 0,
    adjustments: 0,
    files: 0
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

    // 4b. Transfer attempts (if not in ledger)
    if (Array.isArray(db.transferAttempts)) {
      for (const tx of db.transferAttempts) {
        const ok = await syncRecordToSupabase('transactions', {
          id: tx.id,
          sender_id: tx.sender_id || tx.userId,
          beneficiary_account: tx.beneficiary_account,
          amount: tx.amount,
          status: tx.status,
          timestamp: tx.timestamp,
          notes: tx.notes,
          user_id: tx.sender_id,
          beneficiary_name: tx.beneficiary_name || tx.recipient,
          from_account: tx.from || tx.from_account
        });
        if (ok) counts.transactions++;
      }
    }

    // 5. Beneficiaries
    if (typeof db.getBeneficiaries === 'function') {
      for (const ben of db.getBeneficiaries()) {
        const ok = await syncBeneficiaryToSupabase(ben);
        if (ok) counts.beneficiaries++;
      }
    } else if (Array.isArray(db.beneficiaries)) {
      for (const ben of db.beneficiaries) {
        const ok = await syncBeneficiaryToSupabase(ben);
        if (ok) counts.beneficiaries++;
      }
    }

    // 6. Notifications
    const allNotifs = Array.isArray(db.userNotifications) ? db.userNotifications : [];
    for (const notif of allNotifs) {
      const ok = await syncNotificationToSupabase(notif);
      if (ok) counts.notifications++;
    }

    // 7. Applications
    for (const app of db.applications.values()) {
      const ok = await syncApplicationToSupabase(app);
      if (ok) counts.applications++;
    }

    // 8. Activation requests
    if (Array.isArray(db.activationRequests)) {
      for (const req of db.activationRequests) {
        const ok = await syncActivationRequestToSupabase(req);
        if (ok) counts.activationRequests++;
      }
    }

    // 9. Treasury receiving accounts
    if (typeof db.getReceivingAccounts === 'function') {
      for (const rAcc of db.getReceivingAccounts()) {
        const ok = await syncReceivingAccountToSupabase(rAcc);
        if (ok) counts.receivingAccounts++;
      }
    }

    // 10. Audit Logs
    for (const log of db.auditLogs) {
      const ok = await syncRecordToSupabase('audit_logs', {
        id: log.id,
        actor_id: log.actorId,
        actor_name: log.actorName || log.actorUsername,
        action: log.action,
        target_type: log.targetType,
        target_id: log.targetId,
        timestamp: log.timestamp,
        data: log
      });
      if (ok) counts.auditLogs++;
    }

    // 11. Support Cases
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

    // 12. Financial Adjustments
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

    // 13. Files in local upload dirs (fast parallel sync)
    try {
      const uploadsDirs = [
        path.join(process.cwd(), 'data', 'uploads'),
        path.join(process.cwd(), 'public', 'uploads')
      ];
      for (const dir of uploadsDirs) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir).slice(0, 8);
          await Promise.allSettled(files.map(async (file) => {
            try {
              const filePath = path.join(dir, file);
              if (fs.statSync(filePath).isFile()) {
                const fileBuf = fs.readFileSync(filePath);
                const ext = path.extname(file).toLowerCase();
                const cType = ext === '.png' ? 'image/png' : (ext === '.pdf' ? 'application/pdf' : 'image/jpeg');
                await uploadFileToSupabase(fileBuf, file, cType, 'system_sync');
                counts.files++;
              }
            } catch {}
          }));
        }
      }
    } catch (fErr) {
      console.debug('[File Sync Scan Notice]:', fErr);
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
        const nameParts = (row.full_name || '').trim().split(' ');
        const derivedFirstName = row.first_name || nameParts[0] || (row.email ? row.email.split('@')[0] : 'Client');
        const derivedLastName = row.last_name || nameParts.slice(1).join(' ') || '';
        const derivedUsername = row.username || (row.email ? row.email.split('@')[0] : `user_${row.id.slice(0, 6)}`);

        const fullUser = row.profile_data || {
          id: row.id,
          email: row.email,
          username: derivedUsername,
          firstName: derivedFirstName,
          lastName: derivedLastName,
          phone: row.phone || '',
          dialCode: row.dial_code || '+1',
          dateOfBirth: row.date_of_birth || '',
          nationality: row.nationality || 'American',
          passportNumber: row.passport_number,
          passportPhoto: row.passport_photo || row.profile_image_url || 'icon',
          loginPin: row.login_pin || '',
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
        db.userPasswords.set(row.id, '');
        if (fullUser.username) db.userPasswords.set(fullUser.username, '');
        if (fullUser.email) db.userPasswords.set(fullUser.email.toLowerCase(), '');
      }
    }

    // 2. Fetch Accounts
    const { data: accountsData } = await serverSupabaseClient.from('accounts').select('*');
    if (accountsData && accountsData.length > 0) {
      for (const row of accountsData) {
        const balMinor = (row.balance_minor !== undefined && row.balance_minor !== null)
          ? Number(row.balance_minor)
          : (row.balance !== undefined && row.balance !== null ? Math.round(Number(row.balance) * 100) : 0);

        const fullAcc = row.account_data || {
          id: row.id,
          userId: row.user_id,
          accountNumber: row.account_number,
          accountNumberFull: row.account_number_full || row.account_number,
          routingNumber: row.routing_number || '',
          sortCode: row.sort_code || '',
          iban: row.iban || `US89FATL021000089${row.account_number}`,
          swiftBic: row.swift_bic || '',
          name: row.name || row.account_name || '',
          type: row.type || (row.account_type === 'Savings' ? 'SAVINGS_HIGH_YIELD' : 'CHECKING_PREMIER'),
          currency: row.currency || 'USD',
          balanceMinor: balMinor,
          availableBalanceMinor: balMinor,
          pendingHoldMinor: Number(row.pending_hold_minor || 0),
          interestRateAPY: Number(row.interest_rate_apy || (row.account_type === 'Savings' ? 4.85 : 0.0)),
          status: (row.status || 'ACTIVE').toUpperCase(),
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
          cardHolderName: row.card_holder_name || '',
          expiryMonth: row.expiry_month || 12,
          expiryYear: row.expiry_year || 2031,
          cvv: row.cvv || '',
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
