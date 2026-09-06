import custodySeed from '../../src/lib/custodySeedData.json';

export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  const accounts = (custodySeed.accounts || []) as any[];
  const users = (custodySeed.users || []) as any[];

  const totalManagedAssetsUsdMinor = accounts.reduce((sum, a) => {
    if (a.currency === 'USD') return sum + (a.balanceMinor || 0);
    if (a.currency === 'GBP') return sum + Math.round((a.balanceMinor || 0) * 1.274);
    if (a.currency === 'EUR') return sum + Math.round((a.balanceMinor || 0) * 1.087);
    return sum + (a.balanceMinor || 0);
  }, 0);

  return res.status(200).json({
    totalManagedAssetsUsdMinor,
    totalAccounts: accounts.length,
    registeredUsersCount: users.length,
    pendingApplicationsCount: 3,
    activeClearingDesks: 3,
    totalSettledTransactionsCount: 42,
    todayNetFlowUsdMinor: 145000000,
    activeJurisdictions: ['US', 'UK', 'EU']
  });
}
