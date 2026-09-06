import custodySeed from '../../src/lib/custodySeedData.json';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { userId, pin } = body;

    const seedUsers = (custodySeed.users || []) as any[];
    let user = seedUsers.find(u => u.id === userId);

    if (!user) {
      user = {
        id: userId || `usr_${Date.now().toString(36)}`,
        email: 'client@firstatlanticbank.com',
        username: 'client',
        firstName: 'Private',
        lastName: 'Client',
        region: 'US',
        kycTier: 'TIER_2_VERIFIED_PREMIER',
        approval_status: 'APPROVED',
        loginPin: pin || '1234'
      };
    }

    const token = `jwt_session_${user.id}_${Date.now()}`;

    return res.status(200).json({
      success: true,
      token,
      user,
      sessionExpiresAt: new Date(Date.now() + 3600000 * 8).toISOString()
    });
  } catch (err: any) {
    return res.status(200).json({
      success: true,
      token: `jwt_fallback_${Date.now()}`,
      user: {
        id: 'usr_client',
        firstName: 'Private',
        lastName: 'Client',
        approval_status: 'APPROVED'
      }
    });
  }
}
