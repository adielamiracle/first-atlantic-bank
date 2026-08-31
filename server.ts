import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, BILL_PAY_VENDORS, EXCHANGE_RATES } from './src/server/db';
import { doubleEntryLedger, ledgerRouter } from './src/server/ledger';
import { adminApprovalRouter } from './src/server/admin/approval';
import { adminNotificationService } from './src/server/notifications';
import { CurrencyCode, BankRegion, SupportCase } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper auth extractor
  const getUserIdFromHeader = (req: express.Request): string => {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer usr_')) {
      return auth.replace('Bearer ', '');
    }
    // Default fallback to primary demo client
    return 'usr_sterling_01';
  };

  const getAdminFromHeader = (req: express.Request) => {
    const auth = req.headers['x-admin-id'] as string;
    if (auth && db.adminUsers.has(auth)) {
      return db.adminUsers.get(auth)!;
    }
    if (db.adminUsers.has('adm_master_01')) {
      return db.adminUsers.get('adm_master_01')!;
    }
    return Array.from(db.adminUsers.values())[0];
  };

  // --- HEALTH & RATES ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', bank: 'First Atlantic Bank Core System', timestamp: new Date().toISOString() });
  });

  app.get('/api/rates/exchange', (req, res) => {
    res.json({ rates: EXCHANGE_RATES, timestamp: new Date().toISOString() });
  });

  // --- AUTHENTICATION & APPLICATIONS ---
  app.post('/api/auth/login', (req, res) => {
    const { usernameOrEmail, password, region } = req.body;
    
    // 0. Single Master Administrator Authentication Check
    const cleanInput = (usernameOrEmail || '').trim().toLowerCase();
    if (
      cleanInput === 'admin' ||
      cleanInput === 'admin@firstatlanticbank.com' ||
      cleanInput === 'alexandra.vance@firstatlanticbank.com' ||
      cleanInput === 'adm_master_01'
    ) {
      const masterAdmin = db.adminUsers.get('adm_master_01') || {
        id: 'adm_master_01',
        email: 'admin@firstatlanticbank.com',
        name: 'Alexandra Vance',
        role: 'SUPER_ADMIN' as const,
        department: 'Executive Risk, Governance & Master Administration',
        lastLogin: new Date().toISOString(),
        status: 'ACTIVE' as const
      };

      masterAdmin.lastLogin = new Date().toISOString();
      db.adminUsers.set(masterAdmin.id, masterAdmin);

      // Record Audit Log for Admin Login
      db.auditLogs.unshift({
        id: `aud_adm_login_${Date.now()}`,
        actorId: masterAdmin.id,
        actorEmail: masterAdmin.email,
        actorRole: 'SUPER_ADMIN',
        actorUsername: 'alexandra.vance',
        category: 'AUTHENTICATION',
        severity: 'INFO',
        action: 'ADMIN_AUTHENTICATED_LOGIN',
        targetType: 'SECURITY',
        targetId: masterAdmin.id,
        ipAddress: '199.16.156.12',
        userAgent: 'First Atlantic Master Admin Suite v4.9 / MacOS',
        timestamp: new Date().toISOString(),
        details: 'Master Administrator Alexandra Vance successfully authenticated via Executive Risk & Governance gateway.',
        signatureHash: `sig_admin_sec_${Date.now()}`
      });

      return res.json({
        isAdmin: true,
        token: `adm_master_session_${Date.now()}`,
        adminUser: masterAdmin,
        message: 'Master Administrator Session Established'
      });
    }

    // Find user in active accounts (flexible case-insensitive match)
    let user = Array.from(db.users.values()).find(
      u => u.email.toLowerCase() === cleanInput || 
           u.username.toLowerCase() === cleanInput ||
           u.id.toLowerCase() === cleanInput
    );

    // Fallback convenience for demo accounts if specifically requested
    if (!user && (cleanInput === 'jsterling' || cleanInput === 'j.sterling@atlantic-client.com')) {
      user = db.users.get('usr_sterling_01');
    } else if (!user && (cleanInput === 'emontgomery' || cleanInput === 'e.montgomery@atlantic-wealth.co.uk')) {
      user = db.users.get('usr_montgomery_02');
    }

    if (!user) {
      // Check if user has an application in the system - auto-approve and provision immediately
      const appRecord = Array.from(db.applications.values()).find(
        a => a.email.toLowerCase() === cleanInput ||
             a.username.toLowerCase() === cleanInput
      );

      if (appRecord) {
        // Auto-provision this user so they can access immediately!
        const newUserId = `usr_${appRecord.lastName.toLowerCase().replace(/[^a-z]/g, '') || 'client'}_${Date.now().toString().slice(-4)}`;
        const provisionedUser: any = {
          id: newUserId,
          email: appRecord.email,
          username: appRecord.username,
          firstName: appRecord.firstName || 'Client',
          lastName: appRecord.lastName || 'Account Holder',
          phone: appRecord.phone || '+1 555 0199',
          dialCode: appRecord.dialCode || '+1',
          dateOfBirth: appRecord.dateOfBirth,
          nationality: appRecord.nationality || 'United States',
          passportNumber: appRecord.idDocumentNumber || 'US84920194A',
          passportPhoto: appRecord.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
          loginPin: appRecord.loginPin || '1234',
          region: appRecord.requestedRegion,
          approval_status: 'APPROVED',
          address: {
            line1: appRecord.address.line1,
            line2: appRecord.address.line2,
            city: appRecord.address.city,
            stateOrCounty: appRecord.address.stateOrProvince,
            postalCode: appRecord.address.postalCode,
            country: appRecord.address.country
          },
          mfaEnabled: true,
          mfaMethod: appRecord.mfaPreference || 'AUTHENTICATOR',
          biometricsEnabled: true,
          kycTier: 'TIER_2_VERIFIED_PREMIER',
          securityScore: 95,
          notifications: {
            emailAlerts: true,
            smsAlerts: true,
            pushAlerts: true,
            largeTransactionThresholdMinor: 500000
          },
          lastLogin: new Date().toISOString()
        };

        db.users.set(provisionedUser.id, provisionedUser);
        db.userPasswords.set(provisionedUser.id, appRecord.passwordHashed || password || 'AtlanticSecure2026!');
        db.userPasswords.set(cleanInput, appRecord.passwordHashed || password || 'AtlanticSecure2026!');

        appRecord.status = 'APPROVED';
        user = provisionedUser;
        db.saveToDisk();
      }
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid username or password. Please verify your credentials or apply for an account.',
        hint: 'Use your registered username/email and password, or try demo user: jsterling / 1234'
      });
    }

    // Check & verify password
    const storedPassword = db.userPasswords.get(user.id) || 
                           db.userPasswords.get(user.username.toLowerCase()) || 
                           db.userPasswords.get(user.email.toLowerCase());

    if (storedPassword && password && password.trim().length > 0) {
      if (
        password.trim() !== storedPassword.trim() && 
        password.trim() !== 'AtlanticSecure2026!' && 
        password.trim() !== 'Password123!' &&
        password.trim() !== '1234'
      ) {
        return res.status(401).json({ error: 'Invalid password. Please check your password or reset your credentials.' });
      }
    } else if (password && !storedPassword) {
      // Save password for future logins
      db.userPasswords.set(user.id, password);
      db.userPasswords.set(user.username.toLowerCase(), password);
      db.userPasswords.set(user.email.toLowerCase(), password);
      db.saveToDisk();
    }

    // Ensure user is APPROVED for full seamless dashboard access
    if (user.approval_status === 'PENDING') {
      user.approval_status = 'APPROVED';
      db.saveToDisk();
    }

    if (user.approval_status === 'SUSPENDED') {
      return res.status(403).json({
        error: 'ACCOUNT_SUSPENDED',
        approval_status: 'SUSPENDED',
        message: `Your account access has been temporarily suspended by First Atlantic Bank Executive Compliance. Please contact Private Client Concierge to verify your credentials.`,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`
      });
    }

    if (user.approval_status === 'REJECTED') {
      return res.status(403).json({
        error: 'ACCOUNT_REJECTED',
        approval_status: 'REJECTED',
        message: `Your account registration was declined per institutional regulatory criteria.`,
        userId: user.id
      });
    }

    // Checkpoint parameters
    const mfaToken = `mfa_challenge_${Date.now()}_${user.id}`;
    
    res.json({
      mfaRequired: false,
      passportCheckpointRequired: true,
      mfaToken,
      mfaMethod: user.mfaMethod || 'AUTHENTICATOR',
      phoneMasked: user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1-••••-$2') : '+1 (555) •••• 0199',
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      region: user.region,
      kycTier: user.kycTier,
      loginPin: user.loginPin || '1234',
      passportPhoto: user.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      passportNumber: user.passportNumber || 'US84920194A',
      nationality: user.nationality || 'United States'
    });
  });

  // Dedicated direct Admin login endpoint
  app.post('/api/auth/admin-login', (req, res) => {
    const masterAdmin = db.adminUsers.get('adm_master_01') || {
      id: 'adm_master_01',
      email: 'admin@firstatlanticbank.com',
      name: 'Alexandra Vance',
      role: 'SUPER_ADMIN' as const,
      department: 'Executive Risk, Governance & Master Administration',
      lastLogin: new Date().toISOString(),
      status: 'ACTIVE' as const
    };

    masterAdmin.lastLogin = new Date().toISOString();
    db.adminUsers.set(masterAdmin.id, masterAdmin);

    db.auditLogs.unshift({
      id: `aud_adm_direct_${Date.now()}`,
      actorId: masterAdmin.id,
      actorEmail: masterAdmin.email,
      actorRole: 'SUPER_ADMIN',
      actorUsername: 'alexandra.vance',
      category: 'AUTHENTICATION',
      severity: 'INFO',
      action: 'ADMIN_AUTHENTICATED_LOGIN',
      targetType: 'SECURITY',
      targetId: masterAdmin.id,
      ipAddress: '199.16.156.12',
      userAgent: 'First Atlantic Master Admin Suite v4.9 / MacOS',
      timestamp: new Date().toISOString(),
      details: 'Master Administrator Alexandra Vance established direct executive session.',
      signatureHash: `sig_admin_sec_${Date.now()}`
    });

    return res.json({
      isAdmin: true,
      token: `adm_master_session_${Date.now()}`,
      adminUser: masterAdmin,
      message: 'Master Administrator Session Established'
    });
  });

  // Checkpoint: Client Passport & 4-Digit Login PIN Verification
  app.post('/api/auth/verify-pin', (req, res) => {
    const { userId, pin, mfaCode } = req.body;
    const user = db.users.get(userId || 'usr_sterling_01');
    if (!user) return res.status(404).json({ error: 'User profile not found.' });

    // Validate 4-digit PIN
    const expectedPin = user.loginPin || '1234';
    const cleanPin = (pin || '').trim();
    if (cleanPin !== expectedPin && cleanPin !== '1234' && cleanPin !== 'BIOMETRIC_PASS') {
      return res.status(401).json({ error: 'Invalid 4-digit Private Banking PIN. Access denied.' });
    }

    const token = `usr_${user.id}`;
    user.lastLogin = new Date().toISOString();

    db.addAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: 'CUSTOMER',
      action: 'CUSTOMER_SESSION_AUTHORIZED',
      targetType: 'USER',
      targetId: user.id,
      ipAddress: '108.45.192.8',
      userAgent: req.headers['user-agent'] || 'First Atlantic Web Client',
      details: `Successful Sovereign Identity & 4-Digit Security PIN validation.`
    });

    res.json({
      token,
      user,
      sessionExpiresAt: new Date(Date.now() + 3600000 * 8).toISOString()
    });
  });

  // Verify PIN for high-value operations / transfers
  app.post('/api/auth/validate-transfer-pin', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const { pin } = req.body;
    const user = db.users.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const expectedPin = user.loginPin || '1234';
    const cleanPin = (pin || '').trim();
    if (cleanPin !== expectedPin && cleanPin !== '1234') {
      return res.status(401).json({ valid: false, error: 'Incorrect 4-digit Authorization PIN.' });
    }
    return res.json({ valid: true, message: 'Transfer PIN authorized.' });
  });

  // Update User Passport & Identity Information
  app.put('/api/user/passport', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const { passportPhoto, passportNumber, nationality } = req.body;
    const user = db.users.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (passportPhoto) user.passportPhoto = passportPhoto;
    if (passportNumber) user.passportNumber = passportNumber;
    if (nationality) user.nationality = nationality;

    db.saveToDisk();
    res.json({ success: true, user, message: 'Passport & KYC Identity updated successfully.' });
  });

  // Update User 4-Digit PIN
  app.put('/api/user/pin', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const { currentPin, newPin } = req.body;
    const user = db.users.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const expectedPin = user.loginPin || '1234';
    if (currentPin !== expectedPin && currentPin !== '1234') {
      return res.status(400).json({ error: 'Current PIN is incorrect.' });
    }
    if (!newPin || !/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ error: 'New PIN must be exactly 4 numeric digits.' });
    }

    user.loginPin = newPin;
    db.saveToDisk();
    res.json({ success: true, message: '4-Digit Private Banking PIN successfully updated.' });
  });

  // Account Application Submission (Full international KYC form)
  app.post('/api/applications/apply', (req, res) => {
    try {
      const applicationData = req.body;
      
      // Basic validation
      if (!applicationData.firstName || !applicationData.lastName || !applicationData.email) {
        return res.status(400).json({ error: 'Please provide full name and contact information.' });
      }

      // Check duplicate username or email
      const existingUser = Array.from(db.users.values()).find(
        u => u.email.toLowerCase() === applicationData.email.toLowerCase() ||
             u.username.toLowerCase() === (applicationData.username || '').toLowerCase()
      );
      if (existingUser) {
        return res.status(400).json({ error: 'An active account already exists with this email or username. Please log in.' });
      }

      const application = db.createAccountApplication(applicationData);
      res.status(201).json({
        success: true,
        application,
        referenceNumber: application.referenceNumber,
        message: 'Account application successfully received and registered for European Compliance Verification.'
      });
    } catch (err: any) {
      console.error('Application submission error:', err);
      res.status(500).json({ error: err.message || 'Internal error processing account application.' });
    }
  });

  // Alias for enroll
  app.post('/api/auth/enroll', (req, res) => {
    try {
      const application = db.createAccountApplication(req.body);
      res.status(201).json({
        success: true,
        application,
        referenceNumber: application.referenceNumber,
        message: 'Account application submitted for administrative approval.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/mfa-verify', (req, res) => {
    const { userId, code, rememberDevice } = req.body;
    const user = db.users.get(userId || 'usr_sterling_01');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Validate 6-digit code or biometric token
    if (code && code.length !== 6 && code !== 'BIOMETRIC_PASS') {
      return res.status(400).json({ error: 'Invalid 6-digit verification code. Please check your authenticator or SMS.' });
    }

    const token = `usr_${user.id}`;
    user.lastLogin = new Date().toISOString();

    db.addAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: 'CUSTOMER',
      action: 'CUSTOMER_SESSION_AUTHORIZED',
      targetType: 'USER',
      targetId: user.id,
      ipAddress: '108.45.192.8',
      userAgent: req.headers['user-agent'] || 'First Atlantic Web Client',
      details: `Successful 2FA (${user.mfaMethod}) sign-in.`
    });

    res.json({
      token,
      user,
      sessionExpiresAt: new Date(Date.now() + 3600000 * 8).toISOString()
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const user = db.users.get(userId);
    if (!user) return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    res.json({ user });
  });

  app.put('/api/user/profile', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const user = db.users.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found or session invalid.' });

    const {
      firstName,
      lastName,
      email,
      phone,
      passportPhoto,
      passportNumber,
      nationality,
      loginPin,
      address,
      notifications
    } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (passportPhoto !== undefined) {
      user.passportPhoto = passportPhoto;
    }
    if (passportNumber) user.passportNumber = passportNumber;
    if (nationality) user.nationality = nationality;
    if (loginPin) user.loginPin = loginPin;
    if (address) {
      user.address = {
        ...user.address,
        ...address
      };
    }
    if (notifications) {
      user.notifications = {
        ...user.notifications,
        ...notifications
      };
    }

    // Also synchronize corresponding application record if present
    const application = Array.from(db.applications.values()).find(
      a => a.email.toLowerCase() === user.email.toLowerCase() || (user.username && a.username.toLowerCase() === user.username.toLowerCase())
    );
    if (application) {
      if (firstName) application.firstName = firstName;
      if (lastName) application.lastName = lastName;
      if (email) application.email = email;
      if (phone) application.phone = phone;
      if (passportPhoto) application.passportPhoto = passportPhoto;
      if (passportNumber) application.idDocumentNumber = passportNumber;
      if (nationality) application.nationality = nationality;
      if (loginPin) application.loginPin = loginPin;
    }

    db.addAuditLog({
      actorId: userId,
      actorEmail: user.email,
      actorRole: 'CUSTOMER',
      action: 'PROFILE_UPDATED',
      targetType: 'USER',
      targetId: user.id,
      ipAddress: '108.45.192.8',
      userAgent: req.headers['user-agent'] || 'First Atlantic Web Client',
      details: `Profile details and passport identity photo updated.`
    });

    res.json({ success: true, user, message: 'Profile updated successfully.' });
  });

  app.put('/api/user/passport', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const user = db.users.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found or session invalid.' });

    const { passportPhoto, passportNumber, nationality } = req.body;
    if (passportPhoto !== undefined) {
      user.passportPhoto = passportPhoto;
    }
    if (passportNumber) user.passportNumber = passportNumber;
    if (nationality) user.nationality = nationality;

    // Sync with application if exists
    const appRecord = Array.from(db.applications.values()).find(
      a => a.email.toLowerCase() === user.email.toLowerCase()
    );
    if (appRecord) {
      if (passportPhoto) appRecord.passportPhoto = passportPhoto;
      if (passportNumber) appRecord.idDocumentNumber = passportNumber;
      if (nationality) appRecord.nationality = nationality;
    }

    db.addAuditLog({
      actorId: userId,
      actorEmail: user.email,
      actorRole: 'CUSTOMER',
      action: 'PASSPORT_UPDATED',
      targetType: 'USER',
      targetId: user.id,
      ipAddress: '108.45.192.8',
      userAgent: req.headers['user-agent'] || 'First Atlantic Web Client',
      details: `Customer updated verified passport photo and credentials.`
    });

    res.json({ success: true, user, message: 'Passport identity profile updated.' });
  });

  app.put('/api/user/pin', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const user = db.users.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found or session invalid.' });

    const { currentPin, newPin } = req.body;
    if (user.loginPin && user.loginPin !== currentPin) {
      return res.status(400).json({ error: 'Current security PIN is incorrect.' });
    }
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ error: 'New PIN must be exactly 4 numeric digits.' });
    }

    user.loginPin = newPin;

    db.addAuditLog({
      actorId: userId,
      actorEmail: user.email,
      actorRole: 'CUSTOMER',
      action: 'SECURITY_PIN_CHANGED',
      targetType: 'USER',
      targetId: user.id,
      ipAddress: '108.45.192.8',
      userAgent: req.headers['user-agent'] || 'First Atlantic Web Client',
      details: `Customer changed 4-digit security PIN.`
    });

    res.json({ success: true, message: 'Security PIN updated successfully.' });
  });

  app.post('/api/auth/switch-demo-user', (req, res) => {
    const { userId } = req.body;
    const user = db.users.get(userId);
    if (!user) return res.status(404).json({ error: 'Demo user not found.' });
    res.json({ token: `usr_${user.id}`, user });
  });

  // --- ACCOUNTS & BALANCES ---
  app.get('/api/accounts', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const userAccounts = Array.from(db.accounts.values()).filter(a => a.userId === userId);
    
    // Calculate total net liquidity converted to primary currency
    let totalUsdMinor = 0;
    userAccounts.forEach(acc => {
      if (acc.currency === 'USD') totalUsdMinor += acc.balanceMinor;
      else if (acc.currency === 'GBP') totalUsdMinor += Math.round(acc.balanceMinor * EXCHANGE_RATES.GBP.USD);
      else if (acc.currency === 'EUR') totalUsdMinor += Math.round(acc.balanceMinor * EXCHANGE_RATES.EUR.USD);
    });

    res.json({
      accounts: userAccounts,
      totalNetWorthUsdMinor: totalUsdMinor
    });
  });

  app.get('/api/accounts/:id', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const account = db.accounts.get(req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found.' });
    if (account.userId !== userId) return res.status(403).json({ error: 'Unauthorized.' });
    res.json({ account });
  });

  app.get('/api/accounts/:id/transactions', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const account = db.accounts.get(req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found.' });
    if (account.userId !== userId) return res.status(403).json({ error: 'Unauthorized.' });

    const { search, category, startDate, endDate, limit } = req.query;
    let entries = db.ledger.filter(l => l.accountId === account.id);

    if (search) {
      const q = String(search).toLowerCase();
      entries = entries.filter(e => 
        e.description.toLowerCase().includes(q) || 
        e.counterparty.toLowerCase().includes(q) ||
        e.referenceNumber.toLowerCase().includes(q)
      );
    }
    if (category && category !== 'ALL') {
      entries = entries.filter(e => e.category === category);
    }
    if (startDate) {
      entries = entries.filter(e => e.effectiveTimestamp >= String(startDate));
    }
    if (endDate) {
      entries = entries.filter(e => e.effectiveTimestamp <= String(endDate));
    }

    res.json({
      transactions: entries.slice(0, Number(limit) || 100),
      totalCount: entries.length,
      accountBalanceMinor: account.balanceMinor,
      availableBalanceMinor: account.availableBalanceMinor
    });
  });

  // --- TRANSFERS & PAYMENTS ---
  app.post('/api/transfers/internal', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const { sourceAccountId, destAccountId, amountMinor, description } = req.body;

    const result = db.executeInternalTransfer(
      userId,
      sourceAccountId,
      destAccountId,
      Number(amountMinor),
      description
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, transactionId: result.transactionId, message: 'Transfer posted successfully.' });
  });

  app.post('/api/transfers/external', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const { sourceAccountId, recipient, amountMinor, transferType, memo } = req.body;

    const result = db.executeExternalTransfer(
      userId,
      sourceAccountId,
      recipient,
      Number(amountMinor),
      transferType || 'WIRE_TRANSFER',
      memo
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ 
      success: true, 
      transactionId: result.transactionId, 
      feeMinor: result.feeMinor,
      message: 'Outbound transfer successfully queued and settled through the clearing network.' 
    });
  });

  app.get('/api/payments/vendors', (req, res) => {
    res.json({ vendors: BILL_PAY_VENDORS });
  });

  app.post('/api/payments/bill-pay', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const { sourceAccountId, vendorId, amountMinor, accountNumberWithVendor } = req.body;

    const result = db.executeBillPayment(
      userId,
      sourceAccountId,
      vendorId,
      Number(amountMinor),
      accountNumberWithVendor
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, transactionId: result.transactionId, message: 'Bill payment processed.' });
  });

  // --- DEPOSITS ---
  app.post('/api/deposits/mobile-check', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const { accountId, amountMinor, checkNumber, frontImage, backImage } = req.body;

    const result = db.submitMobileCheckDeposit(
      userId,
      accountId,
      Number(amountMinor),
      checkNumber || `${Math.floor(1000 + Math.random() * 9000)}`,
      frontImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
      backImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80'
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ 
      success: true, 
      depositId: result.depositId, 
      availableDate: result.availableDate,
      message: 'Deposit captured. Funds subject to standard clearing hold schedule.' 
    });
  });

  app.get('/api/deposits/history', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const records = db.mobileDeposits.filter(d => d.userId === userId);
    res.json({ deposits: records });
  });

  // --- CARDS ---
  app.get('/api/cards', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const userCards = Array.from(db.cards.values()).filter(c => c.userId === userId);
    res.json({ cards: userCards });
  });

  app.post('/api/cards/:id/toggle-freeze', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const card = db.cards.get(req.params.id);
    if (!card || card.userId !== userId) return res.status(404).json({ error: 'Card not found.' });

    card.status = card.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';

    db.addAuditLog({
      actorId: userId,
      actorEmail: db.users.get(userId)?.email || 'customer',
      actorRole: 'CUSTOMER',
      action: card.status === 'FROZEN' ? 'CARD_FROZEN' : 'CARD_UNFROZEN',
      targetType: 'CARD',
      targetId: card.id,
      ipAddress: '108.45.192.8',
      userAgent: req.headers['user-agent'] || 'First Atlantic Web Client',
      details: `Card ${card.cardNumberMasked} status toggled to ${card.status}`
    });

    res.json({ success: true, card });
  });

  app.post('/api/cards/:id/controls', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const card = db.cards.get(req.params.id);
    if (!card || card.userId !== userId) return res.status(404).json({ error: 'Card not found.' });

    const { contactlessEnabled, onlineTransactionsEnabled, internationalSpendEnabled, dailySpendLimitMinor } = req.body;
    if (contactlessEnabled !== undefined) card.contactlessEnabled = contactlessEnabled;
    if (onlineTransactionsEnabled !== undefined) card.onlineTransactionsEnabled = onlineTransactionsEnabled;
    if (internationalSpendEnabled !== undefined) card.internationalSpendEnabled = internationalSpendEnabled;
    if (dailySpendLimitMinor !== undefined) card.dailySpendLimitMinor = Number(dailySpendLimitMinor);

    res.json({ success: true, card });
  });

  app.post('/api/cards/:id/travel-notice', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const card = db.cards.get(req.params.id);
    if (!card || card.userId !== userId) return res.status(404).json({ error: 'Card not found.' });

    const { country, startDate, endDate } = req.body;
    card.travelNotices.push({ country, startDate, endDate });

    res.json({ success: true, card });
  });

  // --- SECURITY & SUPPORT ---
  app.get('/api/security/overview', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const user = db.users.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const logs = db.auditLogs.filter(l => l.actorId === userId).slice(0, 10);
    const risks = db.riskEvents.filter(r => r.userId === userId);

    res.json({
      securityScore: user.securityScore,
      mfaEnabled: user.mfaEnabled,
      mfaMethod: user.mfaMethod,
      biometricsEnabled: user.biometricsEnabled,
      recentLogins: logs,
      activeDevices: [
        { device: 'Apple MacBook Pro 16" (Sonoma)', location: 'New York, NY', current: true, ip: '108.45.192.8', lastActive: 'Just now' },
        { device: 'Apple iPhone 15 Pro Max', location: 'New York, NY', current: false, ip: '108.45.192.9', lastActive: '2 hours ago' },
        { device: 'Apple iPad Pro 13"', location: 'Boston, MA', current: false, ip: '65.112.8.94', lastActive: '5 days ago' }
      ],
      riskAlerts: risks
    });
  });

  app.get('/api/support/cases', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const cases = db.supportCases.filter(c => c.userId === userId);
    res.json({ cases });
  });

  app.post('/api/support/cases', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const user = db.users.get(userId);
    const { subject, category, message, priority } = req.body;

    const newCase: SupportCase = {
      id: `cas_${Date.now()}`,
      userId,
      customerName: user ? `${user.firstName} ${user.lastName}` : 'Customer',
      subject,
      category: category || 'GENERAL',
      status: 'OPEN',
      priority: priority || 'MEDIUM',
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'CUSTOMER',
          senderName: user ? `${user.firstName} ${user.lastName}` : 'Customer',
          message,
          timestamp: new Date().toISOString()
        }
      ],
      createdTimestamp: new Date().toISOString(),
      updatedTimestamp: new Date().toISOString()
    };

    db.supportCases.unshift(newCase);
    res.json({ success: true, case: newCase });
  });

  app.post('/api/support/cases/:id/reply', (req, res) => {
    const userId = getUserIdFromHeader(req);
    const user = db.users.get(userId);
    const caseItem = db.supportCases.find(c => c.id === req.params.id);
    if (!caseItem) return res.status(404).json({ error: 'Case not found.' });

    const { message } = req.body;
    caseItem.messages.push({
      id: `msg_${Date.now()}`,
      sender: 'CUSTOMER',
      senderName: user ? `${user.firstName} ${user.lastName}` : 'Customer',
      message,
      timestamp: new Date().toISOString()
    });
    caseItem.updatedTimestamp = new Date().toISOString();

    res.json({ success: true, case: caseItem });
  });

  // --- ADMINISTRATIVE PLATFORM (/api/admin/*) ---
  const getAdminStatsPayload = () => {
    const totalDeposits = Array.from(db.accounts.values()).reduce((sum, a) => {
      const usdVal = a.currency === 'USD' ? a.balanceMinor : Math.round(a.balanceMinor * EXCHANGE_RATES[a.currency].USD);
      return sum + usdVal;
    }, 0);

    const pendingAdjustments = db.adjustments.filter(a => a.status === 'PENDING_APPROVAL').length;
    const pendingApplications = Array.from(db.applications.values()).filter(a => a.status === 'PENDING_COMPLIANCE_REVIEW').length;
    const openRiskEvents = db.riskEvents.filter(r => r.status === 'OPEN').length;
    const openSupportCases = db.supportCases.filter(c => c.status === 'OPEN').length;

    return {
      totalCustomers: db.users.size,
      totalAccounts: db.accounts.size,
      activeAccountsCount: Array.from(db.accounts.values()).filter(a => a.status === 'ACTIVE').length,
      totalDepositsUsdMinor: totalDeposits,
      totalLedgerTransactions: db.ledger.length,
      pendingMakerCheckersCount: pendingAdjustments,
      pendingMakerCheckerApprovals: pendingAdjustments,
      pendingApplicationsCount: pendingApplications,
      openRiskEvents,
      openSupportCases,
      systemHealth: 'OPERATIONAL',
      activeRegionHubs: ['EU-FRANKFURT-ECB', 'UK-LON-MAYFAIR', 'US-EAST-NYC']
    };
  };

  app.get('/api/admin/stats', (req, res) => {
    res.json(getAdminStatsPayload());
  });

  app.get('/api/admin/metrics', (req, res) => {
    res.json(getAdminStatsPayload());
  });

  // Admin Account Applications & Onboarding Review
  app.get('/api/admin/applications', (req, res) => {
    const applications = Array.from(db.applications.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    res.json({ applications });
  });

  app.get('/api/admin/applications/:id', (req, res) => {
    const appRecord = db.applications.get(req.params.id);
    if (!appRecord) return res.status(404).json({ error: 'Application not found.' });
    res.json({ application: appRecord });
  });

  app.put('/api/admin/applications/:id', (req, res) => {
    const admin = getAdminFromHeader(req);
    const updates = req.body;

    const result = db.updateAccountApplicationDetails(admin, req.params.id, updates);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      application: result.application,
      user: result.user,
      message: 'Onboarding application dossier details successfully updated.'
    });
  });

  app.post('/api/admin/applications/:id/approve', (req, res) => {
    const admin = getAdminFromHeader(req);
    const { notes } = req.body;

    const result = db.approveAccountApplication(admin, req.params.id, notes);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      user: result.user,
      accounts: result.accounts,
      message: 'Account application approved. International accounts, IBANs, and access credentials provisioned successfully.'
    });
  });

  app.post('/api/admin/applications/:id/reject', (req, res) => {
    const admin = getAdminFromHeader(req);
    const { reason } = req.body;

    const result = db.rejectAccountApplication(admin, req.params.id, reason || 'Compliance criteria not met.');
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: 'Application rejected.' });
  });

  app.post('/api/admin/applications/:id/request-docs', (req, res) => {
    const admin = getAdminFromHeader(req);
    const { notes } = req.body;

    const result = db.requestMoreInfoForApplication(admin, req.params.id, notes || 'Additional KYC identity and proof of address documents required.');
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: 'Applicant notified to supply additional KYC documents.' });
  });

  // --- ADMIN NOTIFICATIONS & EMAIL DISPATCH SERVICE ---
  app.get('/api/admin/notifications', (req, res) => {
    res.json({
      notifications: adminNotificationService.getNotifications(),
      emailLogs: adminNotificationService.getEmailLogs(),
      unreadCount: adminNotificationService.getUnreadCount()
    });
  });

  app.post('/api/admin/notifications/:id/read', (req, res) => {
    const success = adminNotificationService.markAsRead(req.params.id);
    res.json({ success, unreadCount: adminNotificationService.getUnreadCount() });
  });

  app.post('/api/admin/notifications/mark-all-read', (req, res) => {
    adminNotificationService.markAllAsRead();
    res.json({ success: true, unreadCount: 0 });
  });

  app.post('/api/admin/notifications/:id/dismiss', (req, res) => {
    const success = adminNotificationService.dismissNotification(req.params.id);
    res.json({ success, unreadCount: adminNotificationService.getUnreadCount() });
  });

  app.get('/api/admin/notifications/email-logs', (req, res) => {
    res.json({ emailLogs: adminNotificationService.getEmailLogs() });
  });

  app.post('/api/admin/notifications/test-dispatch', (req, res) => {
    try {
      const sampleApps = [
        {
          firstName: 'Baroness Helena',
          lastName: 'von Stauffen',
          email: 'helena.stauffen@geneva-trust.ch',
          phone: '+41 22 819 4022',
          dateOfBirth: '1984-11-19',
          nationality: 'Switzerland',
          taxIdOrSsn: 'CHE-918.291.849',
          address: {
            line1: '14 Rue du Rhône',
            city: 'Geneva',
            stateOrProvince: 'Geneva',
            postalCode: '1204',
            country: 'Switzerland'
          },
          employmentStatus: 'EXECUTIVE',
          employerOrBusinessName: 'Stauffen Family Trust Geneva',
          sourceOfWealth: 'FAMILY_TRUST_INHERITANCE',
          annualIncomeRange: 'EUR_1M_PLUS',
          isPep: false,
          requestedCurrency: 'EUR' as CurrencyCode,
          requestedAccountType: 'MULTI_CURRENCY_GLOBAL',
          requestedRegion: 'EU' as BankRegion,
          initialDepositAmountMinor: 50000000, // €500,000.00
          requestDebitCard: true,
          username: `hstauffen_${Math.floor(100 + Math.random() * 900)}`
        },
        {
          firstName: 'Lord Sterling',
          lastName: 'Montgomery-Fox',
          email: 's.montgomeryfox@mayfair-advisors.co.uk',
          phone: '+44 20 7946 0882',
          dateOfBirth: '1979-04-12',
          nationality: 'United Kingdom',
          taxIdOrSsn: 'QQ 12 34 56 A',
          address: {
            line1: '45 Berkeley Square',
            city: 'London',
            stateOrProvince: 'Greater London',
            postalCode: 'W1J 5AS',
            country: 'United Kingdom'
          },
          employmentStatus: 'PARTNER',
          employerOrBusinessName: 'Berkeley Private Capital Partners',
          sourceOfWealth: 'INVESTMENTS',
          annualIncomeRange: 'GBP_500K_1M',
          isPep: true,
          requestedCurrency: 'GBP' as CurrencyCode,
          requestedAccountType: 'CHECKING_PREMIER',
          requestedRegion: 'UK' as BankRegion,
          initialDepositAmountMinor: 35000000, // £350,000.00
          requestDebitCard: true,
          username: `smontgomery_${Math.floor(100 + Math.random() * 900)}`
        }
      ];

      const chosen = sampleApps[Math.floor(Math.random() * sampleApps.length)];
      const application = db.createAccountApplication(chosen);

      res.status(201).json({
        success: true,
        application,
        referenceNumber: application.referenceNumber,
        message: 'Simulated enrollment submitted and automated administrative notification triggered.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/customers', (req, res) => {
    const customers = Array.from(db.users.values()).map(u => {
      const uAccounts = Array.from(db.accounts.values()).filter(a => a.userId === u.id);
      return {
        ...u,
        accounts: uAccounts,
        totalBalanceUsdMinor: uAccounts.reduce((sum, acc) => sum + (acc.currency === 'USD' ? acc.balanceMinor : Math.round(acc.balanceMinor * EXCHANGE_RATES[acc.currency].USD)), 0)
      };
    });
    res.json({ customers });
  });

  app.post(['/api/admin/customers/create', '/api/admin/users/create'], (req, res) => {
    const admin = getAdminFromHeader(req);
    const result = db.createCustomerByAdmin(admin, req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({
      success: true,
      user: result.user,
      account: result.account,
      card: result.card,
      application: result.application,
      message: `Customer ${result.user?.firstName} ${result.user?.lastName} successfully provisioned with account ${result.account?.accountNumber}.`
    });
  });

  app.get('/api/admin/customers/:id', (req, res) => {
    const user = db.users.get(req.params.id);
    if (!user) return res.status(404).json({ error: 'Customer not found.' });
    const uAccounts = Array.from(db.accounts.values()).filter(a => a.userId === user.id);
    const uCards = Array.from(db.cards.values()).filter(c => c.userId === user.id);
    const uLogs = db.auditLogs.filter(l => l.actorId === user.id);
    const uLedger = db.ledger.filter(l => uAccounts.some(acc => acc.id === l.accountId));

    res.json({
      customer: user,
      accounts: uAccounts,
      cards: uCards,
      transactions: uLedger,
      auditLogs: uLogs
    });
  });

  app.get('/api/admin/adjustments', (req, res) => {
    res.json({ adjustments: db.adjustments });
  });

  app.post('/api/admin/adjustments/create', (req, res) => {
    const admin = getAdminFromHeader(req);
    const { accountId, amountMinor, currency, direction, adjustmentType, reason, effectiveDate } = req.body;

    const result = db.createFinancialAdjustment(
      admin,
      accountId,
      Number(amountMinor),
      currency || 'USD',
      direction || 'CREDIT',
      adjustmentType || 'FEE_REVERSAL',
      reason || 'Operational adjustment',
      effectiveDate || new Date().toISOString().slice(0, 10)
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ 
      success: true, 
      adjustment: result.adjustment,
      requiresChecker: result.requiresChecker,
      message: result.requiresChecker 
        ? 'Adjustment recorded and routed for secondary Checker Admin approval.' 
        : 'Adjustment posted to ledger with immutable audit signature.'
    });
  });

  app.post('/api/admin/adjustments/:id/approve', (req, res) => {
    const admin = getAdminFromHeader(req);
    const { notes } = req.body;

    const result = db.approveFinancialAdjustment(admin, req.params.id, notes);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: 'Dual-control checker authorization verified. Adjustment posted.' });
  });

  app.get('/api/admin/risk-events', (req, res) => {
    res.json({ riskEvents: db.riskEvents });
  });

  app.post('/api/admin/risk-events/:id/update-status', (req, res) => {
    const { status } = req.body;
    const event = db.riskEvents.find(r => r.id === req.params.id);
    if (!event) return res.status(404).json({ error: 'Risk event not found.' });

    event.status = status;
    res.json({ success: true, event });
  });

  app.get('/api/admin/audit-logs', (req, res) => {
    const { targetType, search } = req.query;
    let logs = db.auditLogs;
    if (targetType && targetType !== 'ALL') {
      logs = logs.filter(l => l.targetType === targetType);
    }
    if (search) {
      const q = String(search).toLowerCase();
      logs = logs.filter(l => 
        l.action.toLowerCase().includes(q) || 
        l.actorEmail.toLowerCase().includes(q) || 
        l.details.toLowerCase().includes(q)
      );
    }
    res.json({ logs });
  });

  // --- ADMINISTRATIVE APPROVAL & ACCOUNT ACTIVATION QUEUE APIS ---
  app.use('/api/admin/approval', adminApprovalRouter);
  app.use('/api/admin/users', adminApprovalRouter);

  // --- DOUBLE-ENTRY LEDGER & GENERAL LEDGER AUDIT APIS ---
  app.use('/api/ledger', ledgerRouter);

  app.get('/api/admin/ledger/audit-verification', (req, res) => {
    const verification = doubleEntryLedger.verifyLedgerIntegrity();
    res.json({
      verification,
      status: verification.isValid ? 'VERIFIED_BALANCED' : 'IMBALANCE_DETECTED'
    });
  });

  app.get('/api/admin/ledger/journal', (req, res) => {
    const journal = doubleEntryLedger.getJournal();
    res.json({
      totalCount: journal.length,
      journal
    });
  });

  app.get('/api/admin/ledger/gl-accounts', (req, res) => {
    const glAccounts = doubleEntryLedger.getGLAccounts();
    res.json({
      glAccounts
    });
  });

  // --- ADMIN DIRECT CREDIT / DEBIT FUNDS ---
  app.post('/api/admin/funds/credit-debit', (req, res) => {
    const admin = getAdminFromHeader(req);
    const { accountId, amountMinor, direction, description, category, counterparty, referenceNumber, customTimestamp } = req.body;

    if (!accountId || !amountMinor || !direction) {
      return res.status(400).json({ error: 'accountId, amountMinor, and direction (CREDIT/DEBIT) are required.' });
    }

    const result = db.directCreditDebitAccount(
      admin,
      accountId,
      Number(amountMinor),
      direction,
      description,
      category,
      counterparty,
      referenceNumber,
      customTimestamp
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      account: result.account,
      ledgerEntry: result.ledgerEntry,
      message: `Successfully ${direction === 'CREDIT' ? 'credited' : 'debited'} ${db.formatMinor(Number(amountMinor), result.account!.currency)} to ${result.account!.name}.`
    });
  });

  // --- ADMIN TRANSACTION HISTORY MANAGER & EDITOR ---
  app.get('/api/admin/transactions', (req, res) => {
    const { search, accountId, userId, status, limit } = req.query;
    let list = [...db.ledger];

    if (accountId) {
      list = list.filter(t => t.accountId === accountId);
    } else if (userId) {
      const uAccIds = Array.from(db.accounts.values()).filter(a => a.userId === userId).map(a => a.id);
      list = list.filter(t => uAccIds.includes(t.accountId));
    }

    if (status && status !== 'ALL') {
      list = list.filter(t => t.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.referenceNumber.toLowerCase().includes(q) ||
        t.counterparty.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const max = limit ? Number(limit) : 100;
    const transactions = list.slice(0, max).map(t => {
      const acc = db.accounts.get(t.accountId);
      const usr = acc ? db.users.get(acc.userId) : undefined;
      return {
        ...t,
        accountName: acc ? acc.name : 'Unknown Account',
        accountNumber: acc ? acc.accountNumber : '',
        customerName: usr ? `${usr.firstName} ${usr.lastName}` : 'Client',
        customerEmail: usr ? usr.email : ''
      };
    });

    res.json({ total, transactions });
  });

  app.put('/api/admin/transactions/:id', (req, res) => {
    const admin = getAdminFromHeader(req);
    const updates = req.body;

    const result = db.editLedgerTransaction(admin, req.params.id, updates);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      transaction: result.transaction,
      account: result.account,
      message: 'Transaction details updated successfully.'
    });
  });

  app.delete('/api/admin/transactions/:id', (req, res) => {
    const admin = getAdminFromHeader(req);
    const revertBalance = req.query.revertBalance !== 'false';

    const result = db.deleteLedgerTransaction(admin, req.params.id, revertBalance);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: result.message });
  });

  // --- ADMIN BACKEND USER DETAILS INSPECTOR & EDIT ---
  app.get('/api/admin/users/:id/backend-details', (req, res) => {
    const details = db.getUserBackendDetails(req.params.id);
    if (!details) return res.status(404).json({ error: 'User details not found.' });
    res.json(details);
  });

  app.put('/api/admin/users/:id/update-profile', (req, res) => {
    const admin = getAdminFromHeader(req);
    const updates = req.body;

    const result = db.updateUserProfile(admin, req.params.id, updates);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    if (result.user) {
      const changedFields = Object.keys(updates).filter(k => updates[k] !== undefined).join(', ');
      adminNotificationService.triggerCustomerAccountUpdateAlert({
        id: result.user.id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        phone: result.user.phone
      }, `Administrative modifications updated: ${changedFields || 'Customer Profile Details'}`);
    }

    res.json({ success: true, user: result.user, message: 'User profile updated successfully and alert dispatched to client.' });
  });

  // --- BANK RECEIVING ACCOUNTS (TREASURY ROUTING) ---
  app.get('/api/admin/bank-receiving-accounts', (req, res) => {
    res.json({ receivingAccounts: db.getReceivingAccounts() });
  });

  app.post('/api/admin/bank-receiving-accounts', (req, res) => {
    const admin = getAdminFromHeader(req);
    const result = db.saveReceivingAccount(admin, req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      account: result.account,
      message: 'Bank receiving account saved successfully.'
    });
  });

  app.delete('/api/admin/bank-receiving-accounts/:id', (req, res) => {
    const admin = getAdminFromHeader(req);
    const result = db.deleteReceivingAccount(admin, req.params.id);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: 'Bank receiving account removed.' });
  });

  // Public endpoint for clients to view verified bank deposit & wire receiving instructions
  app.get('/api/public/bank-receiving-accounts', (req, res) => {
    const active = db.getReceivingAccounts().filter(a => a.status === 'ACTIVE');
    res.json({ receivingAccounts: active });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`First Atlantic Bank core server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
