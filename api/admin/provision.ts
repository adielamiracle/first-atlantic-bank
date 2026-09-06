import { createClient } from '@supabase/supabase-js';

const sbUrl = (
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ''
).trim();

const sbKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''
).trim();

const supabase = sbUrl && sbKey ? createClient(sbUrl, sbKey) : null;

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const cleanFirstName = (data.firstName || 'Client').trim();
    const cleanLastName = (data.lastName || 'Member').trim();
    const reg = data.region || 'US';
    const curr = data.currency || (reg === 'UK' ? 'GBP' : reg === 'EU' ? 'EUR' : 'USD');
    const depositMinor = Number(data.initialDepositMinor || 0);

    const userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const accId = `acc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const cardId = `crd_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const appId = `app_${Date.now().toString(36)}`;

    const generatedAccNum = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const account = {
      id: accId,
      userId: userId,
      accountNumber: `•••• ${generatedAccNum.slice(-4)}`,
      accountNumberFull: generatedAccNum,
      routingNumber: reg === 'UK' ? '40-12-88' : reg === 'EU' ? 'FATLDEFF' : '021000089',
      sortCode: reg === 'UK' ? '40-12-88' : undefined,
      iban: reg === 'UK' ? `GB29FATL401288${generatedAccNum}` : reg === 'EU' ? `DE89FATL60311${generatedAccNum}` : `US84FATL021000${generatedAccNum}`,
      swiftBic: reg === 'UK' ? 'FATLGB22' : reg === 'EU' ? 'FATLDEFF' : 'FATLUS33NYC',
      name: data.requestedAccountType === 'SAVINGS_HIGH_YIELD' ? 'Apex High-Yield Reserve' : reg === 'EU' ? 'European Premier Private Checking' : reg === 'UK' ? 'UK Premier Sterling Current Account' : 'Premier Private Checking (USD)',
      type: data.requestedAccountType || 'CHECKING_PREMIER',
      currency: curr,
      balanceMinor: depositMinor,
      availableBalanceMinor: depositMinor,
      pendingHoldMinor: 0,
      interestRateAPY: data.requestedAccountType === 'SAVINGS_HIGH_YIELD' ? 5.15 : 1.25,
      status: 'ACTIVE',
      region: reg,
      openedDate: new Date().toISOString().split('T')[0],
      dailyTransferLimitMinor: 50000000,
      statementCycleDay: 28,
      customerName: `${cleanFirstName} ${cleanLastName}`,
      customerEmail: cleanEmail,
      customerPhone: data.phone || '+1 555-0199'
    };

    const user = {
      id: userId,
      email: cleanEmail,
      username: data.username || cleanEmail.split('@')[0] || `client_${userId.slice(-4)}`,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      phone: data.phone || '+1 555-0199',
      dialCode: data.dialCode || '+1',
      dateOfBirth: data.dateOfBirth || '1988-06-15',
      nationality: data.nationality || 'American',
      passportNumber: data.passportNumber || `PASSPORT-${Date.now().toString().slice(-6)}`,
      passportPhoto: data.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      loginPin: data.loginPin || '1234',
      ssnMasked: data.ssnOrTaxId || '•••-••-8899',
      nationalInsuranceMasked: data.nationalInsuranceMasked || 'QQ 12 34 56 A',
      region: reg,
      approval_status: 'APPROVED',
      address: data.address || {
        line1: '100 Atlantic Plaza',
        city: 'New York',
        stateOrCounty: 'NY',
        postalCode: '10001',
        country: 'United States'
      },
      mfaEnabled: true,
      mfaMethod: 'AUTHENTICATOR',
      biometricsEnabled: true,
      kycTier: data.kycTier || 'TIER_2_VERIFIED_PREMIER',
      securityScore: 95,
      notifications: {
        emailAlerts: true,
        smsAlerts: true,
        pushAlerts: true,
        largeTransactionThresholdMinor: 500000
      },
      lastLogin: new Date().toISOString()
    };

    const card = {
      id: cardId,
      accountId: accId,
      userId: userId,
      cardNumberMasked: '•••• •••• •••• 4188',
      cardNumberFull: '4532 8829 1049 4188',
      cardHolderName: `${cleanFirstName} ${cleanLastName}`.toUpperCase(),
      expiryMonth: 12,
      expiryYear: 2031,
      cvv: '821',
      cardType: 'DEBIT_VISA_SIGNATURE',
      status: 'ACTIVE',
      isVirtual: false,
      contactlessEnabled: true,
      onlineTransactionsEnabled: true,
      internationalSpendEnabled: true,
      dailyAtmLimitMinor: 500000,
      dailySpendLimitMinor: 2500000,
      travelNotices: []
    };

    const application = {
      id: appId,
      referenceNumber: `APP-FAB-${Date.now().toString().slice(-6)}`,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      phone: data.phone || '+1 555-0199',
      requestedRegion: reg,
      requestedCurrency: curr,
      status: 'APPROVED',
      submittedAt: new Date().toISOString()
    };

    // If Supabase is connected, sync user & account
    if (supabase) {
      try {
        await supabase.from('users').upsert({
          id: userId,
          email: cleanEmail,
          first_name: cleanFirstName,
          last_name: cleanLastName,
          username: user.username,
          phone: user.phone,
          region: reg,
          approval_status: 'APPROVED',
          created_at: new Date().toISOString()
        });

        await supabase.from('accounts').insert({
          id: accId,
          user_id: userId,
          account_number: account.accountNumber,
          account_number_full: account.accountNumberFull,
          name: account.name,
          type: account.type,
          currency: account.currency,
          balance_minor: depositMinor,
          status: 'ACTIVE',
          region: reg,
          created_at: new Date().toISOString()
        });
      } catch (sbErr) {
        console.warn('Supabase sync notice:', sbErr);
      }
    }

    return res.status(200).json({
      success: true,
      user,
      account,
      card,
      application,
      message: 'Account successfully provisioned.'
    });
  } catch (err: any) {
    console.error('Provisioning error:', err);
    return res.status(500).json({ error: err?.message || 'Provisioning failed' });
  }
}
