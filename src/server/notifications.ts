import { AccountApplication, AccountActivationRequest, AdminNotification, EmailDispatchLog, NotificationSeverity } from '../types';

export class AdminNotificationService {
  private notifications: AdminNotification[] = [];
  private emailLogs: EmailDispatchLog[] = [];

  constructor() {
    this.seedInitialNotifications();
  }

  private seedInitialNotifications() {
    const now = Date.now();
    const hour = 3600000;
    const day = 86400000;

    // Seeded historical alert for Dr. Camille Laurent
    const email1Id = 'email_init_01';
    this.emailLogs.push({
      id: email1Id,
      recipientEmail: 'alexandra.vance@firstatlanticbank.com',
      recipientName: 'Alexandra Vance (Chief Risk Officer & Master Admin)',
      senderEmail: 'notifications@system.firstatlanticbank.com',
      subject: '[ACTION REQUIRED] New Enrollment Application Pending Approval — FAB-EU-2026-88192 (Dr. Camille Laurent)',
      bodyPreview: 'New European Premier Private Checking enrollment submitted by Dr. Camille Laurent (€150,000.00 initial deposit). Compliance review and KYC approval required.',
      htmlContent: this.generateEmailHtml({
        referenceNumber: 'FAB-EU-2026-88192',
        applicantName: 'Dr. Camille Laurent',
        applicantEmail: 'camille.laurent@sorbonne-med.fr',
        region: 'EU',
        accountType: 'CHECKING_PREMIER',
        currency: 'EUR',
        initialDepositMinor: 15000000,
        riskScore: 22,
        isPep: false,
        nationality: 'France',
        submittedAt: new Date(now - hour * 3).toISOString()
      }),
      sentTimestamp: new Date(now - hour * 3).toISOString(),
      deliveryStatus: 'DELIVERED',
      messageId: `msg_${now - hour * 3}_9812@system.firstatlanticbank.com`,
      category: 'ENROLLMENT_ALERT',
      metadata: {
        applicationId: 'app_paris_02',
        referenceNumber: 'FAB-EU-2026-88192',
        applicantName: 'Dr. Camille Laurent',
        applicantEmail: 'camille.laurent@sorbonne-med.fr',
        region: 'EU',
        accountType: 'CHECKING_PREMIER',
        initialDepositMinor: 15000000,
        riskScore: 22,
        isPep: false
      }
    });

    this.notifications.push({
      id: 'notif_init_01',
      type: 'ENROLLMENT_APPLICATION_SUBMITTED',
      title: 'New Account Application: Dr. Camille Laurent',
      message: 'New application (Ref: FAB-EU-2026-88192) submitted for European Premier Private Checking (€150,000.00 deposit). Awaiting master admin KYC sign-off.',
      severity: 'INFO',
      recipientAdminEmail: 'alexandra.vance@firstatlanticbank.com',
      targetApplicationId: 'app_paris_02',
      targetReferenceNumber: 'FAB-EU-2026-88192',
      applicantName: 'Dr. Camille Laurent',
      applicantEmail: 'camille.laurent@sorbonne-med.fr',
      region: 'EU',
      riskScore: 22,
      isPep: false,
      status: 'UNREAD',
      timestamp: new Date(now - hour * 3).toISOString(),
      emailLogId: email1Id,
      metadata: { initialDepositMinor: 15000000, currency: 'EUR' }
    });

    // Seeded historical alert for Count Henri de Castiglione
    const email2Id = 'email_init_02';
    this.emailLogs.push({
      id: email2Id,
      recipientEmail: 'alexandra.vance@firstatlanticbank.com',
      recipientName: 'Alexandra Vance (Chief Risk Officer & Master Admin)',
      senderEmail: 'notifications@system.firstatlanticbank.com',
      subject: '[URGENT COMPLIANCE] High-Net-Worth Dual-Signature Activation Required — FAB-ACT-2026-9901 (Henri de Castiglione)',
      bodyPreview: 'Dual-signature activation requested for Henri de Castiglione. Master Administrator authorization required.',
      htmlContent: this.generateEmailHtml({
        referenceNumber: 'FAB-ACT-2026-9901',
        applicantName: 'Henri de Castiglione',
        applicantEmail: 'henri.castiglione@lux-private.lu',
        region: 'EU',
        accountType: 'MULTI_CURRENCY_GLOBAL',
        currency: 'EUR',
        initialDepositMinor: 250000000,
        riskScore: 16,
        isPep: false,
        nationality: 'Luxembourg',
        submittedAt: new Date(now - hour * 6).toISOString()
      }),
      sentTimestamp: new Date(now - hour * 6).toISOString(),
      deliveryStatus: 'DELIVERED',
      messageId: `msg_${now - hour * 6}_4410@system.firstatlanticbank.com`,
      category: 'ACTIVATION_ALERT',
      metadata: {
        referenceNumber: 'FAB-ACT-2026-9901',
        applicantName: 'Henri de Castiglione',
        applicantEmail: 'henri.castiglione@lux-private.lu',
        region: 'EU',
        riskScore: 16
      }
    });

    this.notifications.push({
      id: 'notif_init_02',
      type: 'ACTIVATION_REQUEST_SUBMITTED',
      title: 'Dual-Signature Sign-off: Henri de Castiglione',
      message: 'Institutional Private Wealth Euro Reserve activation proposed (Ref: FAB-ACT-2026-9901). Ready for Master Administrator authorization.',
      severity: 'WARNING',
      recipientAdminEmail: 'alexandra.vance@firstatlanticbank.com',
      targetReferenceNumber: 'FAB-ACT-2026-9901',
      applicantName: 'Henri de Castiglione',
      applicantEmail: 'henri.castiglione@lux-private.lu',
      region: 'EU',
      riskScore: 16,
      status: 'UNREAD',
      timestamp: new Date(now - hour * 6).toISOString(),
      emailLogId: email2Id
    });
  }

  /**
   * Trigger Automated Email and System Alert for New User Enrollment Application
   */
  public triggerEnrollmentNotification(app: AccountApplication): {
    notification: AdminNotification;
    emailLog: EmailDispatchLog;
  } {
    const nowIso = new Date().toISOString();
    const notifId = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const emailLogId = `email_log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@system.firstatlanticbank.com`;

    const isHighRisk = app.isPep || app.riskScore >= 40;
    const isMediumRisk = app.riskScore >= 25 || app.initialDepositAmountMinor >= 10000000;
    const severity: NotificationSeverity = isHighRisk ? 'URGENT' : isMediumRisk ? 'WARNING' : 'INFO';

    const formattedDeposit = this.formatMinor(app.initialDepositAmountMinor, app.requestedCurrency);
    const applicantFullName = `${app.firstName} ${app.lastName}`.trim();

    // 1. Generate Institutional Email Template
    const emailSubject = `${isHighRisk ? '[URGENT COMPLIANCE ACTION] ' : '[ACTION REQUIRED] '}New Enrollment Application Pending Approval — ${app.referenceNumber} (${applicantFullName})`;
    const bodyPreview = `New ${app.requestedRegion} (${app.requestedCurrency}) ${app.requestedAccountType.replace('_', ' ')} enrollment submitted by ${applicantFullName} (${formattedDeposit} initial deposit). Risk Score: ${app.riskScore}/100. Compliance review & administrative approval required.`;
    
    const htmlContent = this.generateEmailHtml({
      referenceNumber: app.referenceNumber,
      applicantName: applicantFullName,
      applicantEmail: app.email,
      phone: app.phone,
      region: app.requestedRegion,
      accountType: app.requestedAccountType,
      currency: app.requestedCurrency,
      initialDepositMinor: app.initialDepositAmountMinor,
      riskScore: app.riskScore,
      isPep: app.isPep,
      nationality: app.nationality,
      submittedAt: app.submittedAt || nowIso
    });

    // 2. Record Automated Email Dispatch
    const emailLog: EmailDispatchLog = {
      id: emailLogId,
      recipientEmail: 'alexandra.vance@firstatlanticbank.com',
      recipientName: 'Alexandra Vance (Chief Risk Officer & Master Administrator)',
      senderEmail: 'notifications@system.firstatlanticbank.com',
      subject: emailSubject,
      bodyPreview,
      htmlContent,
      sentTimestamp: nowIso,
      deliveryStatus: 'DELIVERED',
      messageId,
      category: 'ENROLLMENT_ALERT',
      metadata: {
        applicationId: app.id,
        referenceNumber: app.referenceNumber,
        applicantName: applicantFullName,
        applicantEmail: app.email,
        region: app.requestedRegion,
        accountType: app.requestedAccountType,
        initialDepositMinor: app.initialDepositAmountMinor,
        riskScore: app.riskScore,
        isPep: app.isPep
      }
    };
    this.emailLogs.unshift(emailLog);

    // 3. Create System Alert
    const notification: AdminNotification = {
      id: notifId,
      type: 'ENROLLMENT_APPLICATION_SUBMITTED',
      title: `New Enrollment Application: ${applicantFullName}`,
      message: `Applicant ${applicantFullName} has submitted an account application (Ref: ${app.referenceNumber}) for ${app.requestedRegion} ${app.requestedAccountType.replace('_', ' ')} with initial deposit of ${formattedDeposit}. AML Risk: ${app.riskScore}/100${app.isPep ? ' (PEP Flagged)' : ''}.`,
      severity,
      recipientAdminEmail: 'alexandra.vance@firstatlanticbank.com',
      targetApplicationId: app.id,
      targetReferenceNumber: app.referenceNumber,
      applicantName: applicantFullName,
      applicantEmail: app.email,
      region: app.requestedRegion,
      riskScore: app.riskScore,
      isPep: app.isPep,
      status: 'UNREAD',
      timestamp: nowIso,
      emailLogId,
      metadata: {
        accountType: app.requestedAccountType,
        currency: app.requestedCurrency,
        initialDepositMinor: app.initialDepositAmountMinor
      }
    };
    this.notifications.unshift(notification);

    return { notification, emailLog };
  }

  /**
   * Trigger Automated Email and System Alert for Activation Request
   */
  public triggerActivationNotification(req: AccountActivationRequest): {
    notification: AdminNotification;
    emailLog: EmailDispatchLog;
  } {
    const nowIso = new Date().toISOString();
    const notifId = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const emailLogId = `email_log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@system.firstatlanticbank.com`;

    const formattedDeposit = req.initialDepositMinor ? this.formatMinor(req.initialDepositMinor, req.requestedCurrency || 'USD') : '$0.00';
    const emailSubject = `[ACTION REQUIRED] Account Activation Dual-Sign-off — ${req.referenceNumber} (${req.userName})`;
    const bodyPreview = `Dual-signature activation proposed by ${req.makerAdminName} for client ${req.userName} (Ref: ${req.referenceNumber}). Master Administrator signature required for full account clearance.`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #050e1a; color: #f1f5f9; padding: 28px; border-radius: 12px; border: 1px solid #1e293b; max-width: 620px; margin: auto;">
        <div style="border-bottom: 2px solid #d4af37; padding-bottom: 16px; margin-bottom: 20px;">
          <div style="color: #d4af37; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;">First Atlantic Bank • Institutional Control Core</div>
          <h2 style="color: #ffffff; margin: 6px 0 0 0; font-size: 20px;">Dual-Signature Activation Authorization</h2>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          A new customer account activation request requires Master Administrator sign-off:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px;">
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px 0; color: #94a3b8;">Reference:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #d4af37; font-family: monospace;">${req.referenceNumber}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px 0; color: #94a3b8;">Client Name:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #ffffff;">${req.userName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px 0; color: #94a3b8;">Email Address:</td>
            <td style="padding: 8px 0; color: #cbd5e1;">${req.userEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px 0; color: #94a3b8;">Jurisdiction:</td>
            <td style="padding: 8px 0; color: #ffffff;">${req.userRegion} Region</td>
          </tr>
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px 0; color: #94a3b8;">Initial Balance:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #10b981;">${formattedDeposit}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px 0; color: #94a3b8;">Proposed By:</td>
            <td style="padding: 8px 0; color: #cbd5e1;">${req.makerAdminName} (${req.makerAdminRole})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">Justification:</td>
            <td style="padding: 8px 0; color: #cbd5e1;">${req.reason}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; text-align: center;">
          Confidential Automated Notification • First Atlantic Bank (Suisse &amp; Transatlantic) N.A.
        </div>
      </div>
    `;

    const emailLog: EmailDispatchLog = {
      id: emailLogId,
      recipientEmail: 'alexandra.vance@firstatlanticbank.com',
      recipientName: 'Alexandra Vance (Chief Risk Officer & Master Administrator)',
      senderEmail: 'notifications@system.firstatlanticbank.com',
      subject: emailSubject,
      bodyPreview,
      htmlContent,
      sentTimestamp: nowIso,
      deliveryStatus: 'DELIVERED',
      messageId,
      category: 'ACTIVATION_ALERT',
      metadata: {
        referenceNumber: req.referenceNumber,
        applicantName: req.userName,
        applicantEmail: req.userEmail,
        region: req.userRegion,
        riskScore: req.riskScore
      }
    };
    this.emailLogs.unshift(emailLog);

    const notification: AdminNotification = {
      id: notifId,
      type: 'ACTIVATION_REQUEST_SUBMITTED',
      title: `Dual-Signature Activation: ${req.userName}`,
      message: `Activation request (Ref: ${req.referenceNumber}) submitted by ${req.makerAdminName}. Ready for Master Administrator authorization.`,
      severity: 'WARNING',
      recipientAdminEmail: 'alexandra.vance@firstatlanticbank.com',
      targetReferenceNumber: req.referenceNumber,
      applicantName: req.userName,
      applicantEmail: req.userEmail,
      region: req.userRegion,
      riskScore: req.riskScore,
      status: 'UNREAD',
      timestamp: nowIso,
      emailLogId
    };
    this.notifications.unshift(notification);

    return { notification, emailLog };
  }

  public getNotifications(): AdminNotification[] {
    return this.notifications;
  }

  public getEmailLogs(): EmailDispatchLog[] {
    return this.emailLogs;
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => n.status === 'UNREAD').length;
  }

  public markAsRead(id: string): boolean {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.status = 'READ';
      return true;
    }
    return false;
  }

  public markAllAsRead(): void {
    this.notifications.forEach(n => {
      if (n.status === 'UNREAD') n.status = 'READ';
    });
  }

  public dismissNotification(id: string): boolean {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index].status = 'DISMISSED';
      return true;
    }
    return false;
  }

  private generateEmailHtml(data: {
    referenceNumber: string;
    applicantName: string;
    applicantEmail: string;
    phone?: string;
    region: string;
    accountType: string;
    currency: string;
    initialDepositMinor: number;
    riskScore: number;
    isPep?: boolean;
    nationality?: string;
    submittedAt: string;
  }): string {
    const formattedDeposit = this.formatMinor(data.initialDepositMinor, data.currency as any);
    const riskBadgeColor = data.riskScore < 25 ? '#10b981' : data.riskScore < 50 ? '#f59e0b' : '#ef4444';
    const riskLabel = data.riskScore < 25 ? 'LOW RISK' : data.riskScore < 50 ? 'MEDIUM RISK / REVIEW' : 'HIGH RISK / ENHANCED DUE DILIGENCE';

    return `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif; background-color: #050e1a; color: #f1f5f9; padding: 32px 24px; border-radius: 12px; border: 1px solid #1e293b; max-width: 640px; margin: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <!-- Header Banner -->
        <div style="border-bottom: 2px solid #d4af37; padding-bottom: 18px; margin-bottom: 22px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="color: #d4af37; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">First Atlantic Bank</span>
              <h2 style="color: #ffffff; margin: 0; font-size: 21px; font-weight: 700; font-family: Georgia, serif;">Executive Compliance Alert</h2>
            </div>
            <div style="background-color: #0f2744; border: 1px solid #c5a880; color: #d4af37; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; font-family: monospace;">
              AUTO-DISPATCH
            </div>
          </div>
        </div>

        <!-- Alert Intro -->
        <div style="background-color: #0c1e33; border-left: 4px solid #d4af37; padding: 14px 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 22px;">
          <p style="margin: 0; font-size: 13.5px; line-height: 1.5; color: #e2e8f0;">
            <strong>Immediate Administrative Notice:</strong> A new international account enrollment application has been registered into the European &amp; International Compliance Queue and requires master administrator verification.
          </p>
        </div>

        <!-- Application Summary Table -->
        <div style="background-color: #081524; border: 1px solid #1e293b; border-radius: 8px; padding: 18px; margin-bottom: 22px;">
          <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
            Application Dossier Summary
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #132438;">
              <td style="padding: 9px 0; color: #94a3b8; width: 40%;">Reference Number:</td>
              <td style="padding: 9px 0; font-weight: 700; color: #d4af37; font-family: monospace; font-size: 14px;">${data.referenceNumber}</td>
            </tr>
            <tr style="border-bottom: 1px solid #132438;">
              <td style="padding: 9px 0; color: #94a3b8;">Applicant Name:</td>
              <td style="padding: 9px 0; font-weight: 700; color: #ffffff;">${data.applicantName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #132438;">
              <td style="padding: 9px 0; color: #94a3b8;">Email Address:</td>
              <td style="padding: 9px 0; color: #38bdf8;">${data.applicantEmail}</td>
            </tr>
            ${data.phone ? `
            <tr style="border-bottom: 1px solid #132438;">
              <td style="padding: 9px 0; color: #94a3b8;">Phone:</td>
              <td style="padding: 9px 0; color: #cbd5e1;">${data.phone}</td>
            </tr>` : ''}
            <tr style="border-bottom: 1px solid #132438;">
              <td style="padding: 9px 0; color: #94a3b8;">Nationality / Jurisdiction:</td>
              <td style="padding: 9px 0; color: #ffffff;">${data.nationality || 'European Union'} (${data.region} Booking Center)</td>
            </tr>
            <tr style="border-bottom: 1px solid #132438;">
              <td style="padding: 9px 0; color: #94a3b8;">Requested Product:</td>
              <td style="padding: 9px 0; color: #cbd5e1;">${data.accountType.replace(/_/g, ' ')} (${data.currency})</td>
            </tr>
            <tr style="border-bottom: 1px solid #132438;">
              <td style="padding: 9px 0; color: #94a3b8;">Initial Remittance:</td>
              <td style="padding: 9px 0; font-weight: 700; color: #10b981; font-size: 14px;">${formattedDeposit}</td>
            </tr>
            <tr>
              <td style="padding: 9px 0; color: #94a3b8;">AML Heuristic Assessment:</td>
              <td style="padding: 9px 0;">
                <span style="display: inline-block; background-color: ${riskBadgeColor}22; border: 1px solid ${riskBadgeColor}; color: ${riskBadgeColor}; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">
                  Score: ${data.riskScore}/100 • ${riskLabel}
                </span>
                ${data.isPep ? '<span style="display: inline-block; margin-left: 6px; background-color: #ef444422; border: 1px solid #ef4444; color: #ef4444; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">PEP IDENTIFIED</span>' : ''}
              </td>
            </tr>
          </table>
        </div>

        <!-- Compliance Protocol Note -->
        <div style="padding: 12px 16px; background-color: #07101d; border-radius: 6px; border: 1px solid #1e293b; font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 22px;">
          <strong style="color: #cbd5e1;">Compliance Protocol:</strong> Please review identity documentation, beneficial ownership, and sanctions screenings in the First Atlantic Institutional Admin Suite prior to issuing account IBANs and dual-signature approval.
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #1e293b; padding-top: 16px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.4;">
          <p style="margin: 0 0 4px 0;">First Atlantic Bank Institutional Core Engine • 1 Wall Street, New York &amp; 8 Grosvenor Crescent, London</p>
          <p style="margin: 0;">This is an automated regulatory notification sent to designated Compliance Officers &amp; Super Administrators.</p>
        </div>
      </div>
    `;
  }

  private formatMinor(minor: number, currency: 'USD' | 'GBP' | 'EUR'): string {
    const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';
    return `${symbol}${(minor / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export const adminNotificationService = new AdminNotificationService();
