export type CurrencyCode = 'USD' | 'GBP' | 'EUR';
export type BankRegion = 'US' | 'UK' | 'EU';

export type AccountType = 
  | 'CHECKING_PREMIER'
  | 'SAVINGS_HIGH_YIELD'
  | 'TREASURY_BUSINESS'
  | 'MULTI_CURRENCY_GLOBAL'
  | 'CREDIT_CARD_INFINITE'
  | 'MORTGAGE_FIXED';

export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'RESTRICTED' | 'DORMANT' | 'CLOSED';

export type TransactionType = 
  | 'ACH_TRANSFER'
  | 'WIRE_TRANSFER'
  | 'FASTER_PAYMENTS'
  | 'CHAPS'
  | 'INTERNAL_TRANSFER'
  | 'BILL_PAYMENT'
  | 'CARD_PURCHASE'
  | 'MOBILE_DEPOSIT'
  | 'INTEREST_PAYMENT'
  | 'ADMIN_ADJUSTMENT'
  | 'FEE_CHARGE'
  | 'REFUND';

export type TransactionDirection = 'DEBIT' | 'CREDIT';
export type TransactionStatus = 'SETTLED' | 'PENDING' | 'HELD' | 'FAILED' | 'REVERSED' | 'AWAITING_APPROVAL';

export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  direction: TransactionDirection;
  amountMinor: number; // in minor currency units (e.g. cents, pence)
  currency: CurrencyCode;
  balanceAfterMinor: number;
  description: string;
  category: 'Income' | 'Transfers' | 'Bills & Utilities' | 'Shopping & Dining' | 'Travel' | 'Fees & Interest' | 'Deposits' | 'Adjustments';
  counterparty: string;
  status: TransactionStatus;
  channel: 'ONLINE' | 'MOBILE' | 'WIRE' | 'ACH' | 'FPS' | 'CHAPS' | 'CARD_POS' | 'ADMIN_PORTAL';
  referenceNumber: string;
  createdTimestamp: string;
  effectiveTimestamp: string;
  settledTimestamp?: string;
  metadata?: Record<string, any>;
}

export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string; // masked in UI except on verified detail
  accountNumberFull: string;
  routingNumber?: string; // US routing ABA
  sortCode?: string; // UK 6-digit sort code
  iban?: string; // UK / EU IBAN
  swiftBic: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balanceMinor: number;
  availableBalanceMinor: number;
  pendingHoldMinor: number;
  interestRateAPY?: number; // e.g. 5.15
  creditLimitMinor?: number; // for credit cards
  status: AccountStatus;
  region: BankRegion;
  openedDate: string;
  dailyTransferLimitMinor: number;
  statementCycleDay: number;
}

export type CardType = 'DEBIT_VISA_SIGNATURE' | 'CREDIT_ATLANTIC_INFINITE' | 'BUSINESS_EXPENSE';
export type CardStatus = 'ACTIVE' | 'FROZEN' | 'LOCKED' | 'EXPIRED' | 'CANCELLED';

export type UserApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface BankCard {
  id: string;
  accountId: string;
  userId: string;
  cardNumberMasked: string;
  cardNumberFull: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardType: CardType;
  status: CardStatus;
  isVirtual: boolean;
  contactlessEnabled: boolean;
  onlineTransactionsEnabled: boolean;
  internationalSpendEnabled: boolean;
  dailyAtmLimitMinor: number;
  dailySpendLimitMinor: number;
  travelNotices: { country: string; startDate: string; endDate: string }[];
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  ssnMasked?: string;
  nationalInsuranceMasked?: string;
  region: BankRegion;
  approval_status: UserApprovalStatus;
  address: {
    line1: string;
    line2?: string;
    city: string;
    stateOrCounty: string;
    postalCode: string;
    country: string;
  };
  mfaEnabled: boolean;
  mfaMethod: 'AUTHENTICATOR' | 'SMS' | 'EMAIL';
  biometricsEnabled: boolean;
  kycTier: 'TIER_1_STANDARD' | 'TIER_2_VERIFIED_PREMIER' | 'TIER_3_INSTITUTIONAL';
  securityScore: number;
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    pushAlerts: boolean;
    largeTransactionThresholdMinor: number;
  };
  lastLogin: string;
}

export type AdminRole = 
  | 'SUPER_ADMIN'
  | 'BANK_ADMIN'
  | 'OPERATIONS'
  | 'COMPLIANCE'
  | 'CUSTOMER_SUPPORT'
  | 'FINANCE'
  | 'AUDITOR';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  department: string;
  lastLogin: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: AdminRole | 'CUSTOMER';
  actorUsername?: string;
  category?: string;
  severity?: string;
  checksumHash?: string;
  action: string;
  targetType: 'ACCOUNT' | 'USER' | 'TRANSACTION' | 'CARD' | 'SYSTEM' | 'SECURITY';
  targetId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details: string;
  previousState?: any;
  newState?: any;
  approvalId?: string;
  signatureHash: string;
}

export interface MakerCheckerRequest {
  id: string;
  actionType: string;
  targetAccountId: string;
  amountMinor?: number;
  direction?: 'CREDIT' | 'DEBIT';
  reason: string;
  makerUsername: string;
  checkerUsername?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt?: string;
}

export interface FinancialAdjustment {
  id: string;
  referenceNumber: string;
  accountId: string;
  accountNumber: string;
  customerName: string;
  amountMinor: number;
  currency: CurrencyCode;
  direction: TransactionDirection;
  adjustmentType: 'FEE_REVERSAL' | 'CUSTOMER_REFUND' | 'MANUAL_DEPOSIT_CORRECTION' | 'CHARGEBACK_SETTLEMENT' | 'RECONCILIATION_ENTRY';
  reason: string;
  effectiveDate: string; // backdate capable without deleting historical transactions
  makerAdminId: string;
  makerAdminName: string;
  checkerAdminId?: string;
  checkerAdminName?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED_AND_POSTED' | 'REJECTED';
  createdTimestamp: string;
  postedTimestamp?: string;
  approvalNotes?: string;
}

export interface RiskEvent {
  id: string;
  userId: string;
  customerName: string;
  riskScore: number; // 0-100
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  eventType: 'IMPOSSIBLE_TRAVEL' | 'VELOCITY_SPIKE' | 'LARGE_CROSS_BORDER' | 'FAILED_LOGIN_SERIES' | 'UNRECOGNIZED_DEVICE';
  description: string;
  ipAddress: string;
  location: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESTRICTED' | 'DISMISSED';
  timestamp: string;
}

export interface SupportCase {
  id: string;
  userId: string;
  customerName: string;
  subject: string;
  category: 'TRANSFERS' | 'FRAUD_SECURITY' | 'CARDS' | 'ACCOUNT_MAINTENANCE' | 'GENERAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  messages: {
    id: string;
    sender: 'CUSTOMER' | 'SUPPORT_AGENT';
    senderName: string;
    message: string;
    timestamp: string;
  }[];
  createdTimestamp: string;
  updatedTimestamp: string;
}

export interface ExchangeRate {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  timestamp: string;
}

export interface MobileDepositRecord {
  id: string;
  userId: string;
  accountId: string;
  amountMinor: number;
  currency: CurrencyCode;
  checkNumber: string;
  frontImage: string;
  backImage: string;
  status: 'PENDING_VERIFICATION' | 'CLEARED' | 'HOLD_APPLIED' | 'REJECTED';
  availableDate: string;
  submittedTimestamp: string;
  holdReason?: string;
}

export interface BillPayVendor {
  id: string;
  name: string;
  category: 'UTILITY' | 'TELECOM' | 'CREDIT_CARD' | 'GOVERNMENT_TAX' | 'INSURANCE' | 'MORTGAGE';
  billerCode: string;
  region: BankRegion;
  logo: string;
}

export type ApplicationStatus = 
  | 'PENDING_COMPLIANCE_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ADDITIONAL_INFO_REQUIRED';

export interface AccountApplication {
  id: string;
  referenceNumber: string; // e.g. FAB-EU-2026-88192
  
  // Applicant Identity
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  taxIdOrSsn: string;
  idDocumentType: 'PASSPORT' | 'EU_NATIONAL_ID' | 'DRIVING_LICENSE';
  idDocumentNumber: string;
  idDocumentFileName?: string;
  proofOfAddressFileName?: string;
  
  // Residential Address
  address: {
    line1: string;
    line2?: string;
    city: string;
    stateOrProvince: string;
    postalCode: string;
    country: string;
  };

  // Financial & KYC Profile
  employmentStatus: 'EMPLOYED' | 'SELF_EMPLOYED' | 'BUSINESS_OWNER' | 'EXECUTIVE' | 'RETIRED';
  employerOrBusinessName?: string;
  sourceOfWealth: 'SALARY' | 'BUSINESS_PROCEEDS' | 'INVESTMENTS' | 'INHERITANCE' | 'REAL_ESTATE';
  annualIncomeRange: string;
  isPep: boolean; // Politically Exposed Person
  
  // Product Selection
  requestedCurrency: CurrencyCode;
  requestedAccountType: AccountType;
  requestedRegion: BankRegion;
  initialDepositAmountMinor: number;
  requestDebitCard: boolean;
  
  // Credentials & Security
  username: string;
  passwordHashed?: string;
  mfaPreference: 'AUTHENTICATOR' | 'SMS' | 'EMAIL';

  // Compliance & Review Pipeline
  status: ApplicationStatus;
  riskScore: number; // 0-100 AML heuristic score (lower is safer)
  submittedAt: string;
  reviewedAt?: string;
  reviewedByAdminId?: string;
  reviewedByAdminName?: string;
  complianceNotes?: string;
  rejectionReason?: string;
  
  // Resulting Accounts (populated upon approval)
  createdUserId?: string;
  provisionedIban?: string;
  provisionedSortCode?: string;
  provisionedRoutingNumber?: string;
  provisionedAccountNumber?: string;
}

export type ActivationStatus = 'PENDING_DUAL_APPROVAL' | 'ACTIVATED' | 'REJECTED';

export interface AccountActivationRequest {
  id: string;
  userId: string;
  applicationId?: string;
  referenceNumber: string;
  userName: string;
  userEmail: string;
  userRegion: BankRegion;
  requestedAccountType?: string;
  requestedCurrency?: CurrencyCode;
  initialDepositMinor?: number;
  riskScore: number;
  reason: string;
  targetApprovalStatus: UserApprovalStatus;
  
  // Dual-Signature Fields
  makerAdminId: string;
  makerAdminName: string;
  makerAdminRole: string;
  makerTimestamp: string;
  makerNotes?: string;
  makerSignatureHash: string;

  checkerAdminId?: string;
  checkerAdminName?: string;
  checkerAdminRole?: string;
  checkerTimestamp?: string;
  checkerNotes?: string;
  checkerSignatureHash?: string;

  status: ActivationStatus;
  statusNotes?: string;
}

export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'URGENT';

export type NotificationType = 
  | 'ENROLLMENT_APPLICATION_SUBMITTED' 
  | 'ACTIVATION_REQUEST_SUBMITTED' 
  | 'HIGH_RISK_AML_ALERT' 
  | 'SECURITY_EVENT';

export interface EmailDispatchLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  senderEmail: string;
  subject: string;
  bodyPreview: string;
  htmlContent: string;
  sentTimestamp: string;
  deliveryStatus: 'DELIVERED' | 'QUEUED' | 'SENT';
  messageId: string;
  category: 'ENROLLMENT_ALERT' | 'ACTIVATION_ALERT' | 'AML_COMPLIANCE';
  metadata?: {
    applicationId?: string;
    referenceNumber?: string;
    applicantName?: string;
    applicantEmail?: string;
    region?: BankRegion;
    accountType?: string;
    initialDepositMinor?: number;
    riskScore?: number;
    isPep?: boolean;
  };
}

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  recipientAdminEmail: string;
  targetApplicationId?: string;
  targetReferenceNumber?: string;
  applicantName?: string;
  applicantEmail?: string;
  region?: BankRegion;
  riskScore?: number;
  isPep?: boolean;
  status: 'UNREAD' | 'READ' | 'ACTIONED' | 'DISMISSED';
  timestamp: string;
  emailLogId?: string;
  metadata?: Record<string, any>;
}

export interface BankReceivingAccount {
  id: string;
  label: string;
  bankName: string;
  beneficiaryName: string;
  accountNumberOrIban: string;
  routingNumber?: string;
  sortCode?: string;
  swiftBic: string;
  currency: CurrencyCode;
  region: BankRegion;
  bankAddress: string;
  intermediaryBankName?: string;
  intermediarySwiftBic?: string;
  specialInstructions?: string;
  isDefault: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  updatedAt: string;
}



