import custodySeed from '../src/lib/custodySeedData.json';

export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  const url = req.url || '';

  if (url.includes('/api/health')) {
    return res.status(200).json({ status: 'ok', time: new Date().toISOString() });
  }

  if (url.includes('/api/admin/accounts')) {
    return res.status(200).json({
      success: true,
      totalCount: custodySeed.accounts.length,
      accounts: custodySeed.accounts
    });
  }

  if (url.includes('/api/admin/users')) {
    return res.status(200).json({
      success: true,
      count: custodySeed.users.length,
      users: custodySeed.users
    });
  }

  if (url.includes('/api/admin/stats')) {
    return res.status(200).json({
      totalAccounts: custodySeed.accounts.length,
      totalManagedAssetsUsdMinor: 14820000000,
      pendingApplicationsCount: 3,
      activeClearingDesks: 3
    });
  }

  if (url.includes('/api/rates/exchange')) {
    return res.status(200).json({
      base: 'USD',
      rates: {
        USD: { USD: 1.0, GBP: 0.785, EUR: 0.92 },
        GBP: { USD: 1.274, GBP: 1.0, EUR: 1.172 },
        EUR: { USD: 1.087, GBP: 0.853, EUR: 1.0 }
      }
    });
  }

  // Default fallback for any unspecified api route - return valid JSON, NEVER HTML!
  return res.status(200).json({
    success: true,
    message: 'First Atlantic Bank Sovereign Node',
    endpoint: url,
    timestamp: new Date().toISOString()
  });
}
