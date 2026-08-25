export interface RegisteredBank {
  id: string;
  name: string;
  shortName: string;
  country: 'US' | 'UK' | 'EU' | 'GLOBAL';
  countryName: string;
  routingOrSortCode: string;
  codeType: 'ABA Routing' | 'Sort Code' | 'SWIFT/BIC' | 'BLZ';
  swiftBic: string;
  clearingRail: string;
  iconType?: string;
  isPopular?: boolean;
}

export const REGISTERED_BANKS: RegisteredBank[] = [
  // ==================== UNITED STATES (FEDWIRE / ACH) ====================
  {
    id: 'us_jpmorgan_chase',
    name: 'JPMorgan Chase Bank, N.A.',
    shortName: 'Chase',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '021000021',
    codeType: 'ABA Routing',
    swiftBic: 'CHASUS33',
    clearingRail: 'Fedwire / Real-Time ACH',
    isPopular: true
  },
  {
    id: 'us_bank_of_america',
    name: 'Bank of America, N.A.',
    shortName: 'Bank of America',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '026009593',
    codeType: 'ABA Routing',
    swiftBic: 'BOFAUS3N',
    clearingRail: 'Fedwire / ACH',
    isPopular: true
  },
  {
    id: 'us_wells_fargo',
    name: 'Wells Fargo Bank, N.A.',
    shortName: 'Wells Fargo',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '121000248',
    codeType: 'ABA Routing',
    swiftBic: 'WFBIUS6S',
    clearingRail: 'Fedwire / ACH',
    isPopular: true
  },
  {
    id: 'us_citibank',
    name: 'Citibank, N.A.',
    shortName: 'Citibank',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '021000089',
    codeType: 'ABA Routing',
    swiftBic: 'CITIUS33',
    clearingRail: 'Fedwire / CHIPS',
    isPopular: true
  },
  {
    id: 'us_goldman_sachs',
    name: 'Goldman Sachs Bank USA',
    shortName: 'Goldman Sachs',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '124003058',
    codeType: 'ABA Routing',
    swiftBic: 'GSCOUS33',
    clearingRail: 'Fedwire High-Value Rail',
    isPopular: true
  },
  {
    id: 'us_morgan_stanley',
    name: 'Morgan Stanley Private Bank, N.A.',
    shortName: 'Morgan Stanley',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '026013576',
    codeType: 'ABA Routing',
    swiftBic: 'MSNYUS33',
    clearingRail: 'Fedwire / Institutional Clearing',
    isPopular: true
  },
  {
    id: 'us_us_bank',
    name: 'U.S. Bank National Association',
    shortName: 'U.S. Bank',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '091000022',
    codeType: 'ABA Routing',
    swiftBic: 'USBKUS44',
    clearingRail: 'Fedwire / ACH'
  },
  {
    id: 'us_pnc_bank',
    name: 'PNC Bank, National Association',
    shortName: 'PNC Bank',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '043000096',
    codeType: 'ABA Routing',
    swiftBic: 'PNCCUS33',
    clearingRail: 'Fedwire / ACH'
  },
  {
    id: 'us_truist',
    name: 'Truist Bank',
    shortName: 'Truist',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '061000104',
    codeType: 'ABA Routing',
    swiftBic: 'SNTRUS3A',
    clearingRail: 'Fedwire / ACH'
  },
  {
    id: 'us_capital_one',
    name: 'Capital One, N.A.',
    shortName: 'Capital One',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '051405515',
    codeType: 'ABA Routing',
    swiftBic: 'NFBKUS33',
    clearingRail: 'Fedwire / ACH'
  },
  {
    id: 'us_td_bank',
    name: 'TD Bank, N.A.',
    shortName: 'TD Bank',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '031101266',
    codeType: 'ABA Routing',
    swiftBic: 'NRTHUS33',
    clearingRail: 'Fedwire / ACH'
  },
  {
    id: 'us_bny_mellon',
    name: 'The Bank of New York Mellon (BNY)',
    shortName: 'BNY Mellon',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '011001234',
    codeType: 'ABA Routing',
    swiftBic: 'IRVTUS3N',
    clearingRail: 'Fedwire / Institutional Custody'
  },
  {
    id: 'us_charles_schwab',
    name: 'Charles Schwab Bank, SSB',
    shortName: 'Charles Schwab',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '121202211',
    codeType: 'ABA Routing',
    swiftBic: 'SCHWUS66',
    clearingRail: 'Fedwire / Brokerage Direct',
    isPopular: true
  },
  {
    id: 'us_fidelity',
    name: 'Fidelity Investments (UMB Bank)',
    shortName: 'Fidelity',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '101000695',
    codeType: 'ABA Routing',
    swiftBic: 'UMBFUS44',
    clearingRail: 'Fedwire / Brokerage Direct'
  },
  {
    id: 'us_first_citizens',
    name: 'First Citizens Bank (Silicon Valley Bank)',
    shortName: 'First Citizens / SVB',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '121140399',
    codeType: 'ABA Routing',
    swiftBic: 'FCBKUS33',
    clearingRail: 'Fedwire / Commercial'
  },
  {
    id: 'us_hsbc_usa',
    name: 'HSBC Bank USA, N.A.',
    shortName: 'HSBC USA',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '021001088',
    codeType: 'ABA Routing',
    swiftBic: 'HSBCUS33',
    clearingRail: 'Fedwire / Global SWIFT'
  },
  {
    id: 'us_ally_bank',
    name: 'Ally Bank',
    shortName: 'Ally',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '124085066',
    codeType: 'ABA Routing',
    swiftBic: 'ALLYUS33',
    clearingRail: 'Fedwire / Real-Time ACH'
  },
  {
    id: 'us_navy_federal',
    name: 'Navy Federal Credit Union',
    shortName: 'Navy Federal',
    country: 'US',
    countryName: 'United States',
    routingOrSortCode: '256074974',
    codeType: 'ABA Routing',
    swiftBic: 'NFCUUS33',
    clearingRail: 'Fedwire / ACH'
  },

  // ==================== UNITED KINGDOM (FASTER PAYMENTS / CHAPS / BACS) ====================
  {
    id: 'uk_barclays',
    name: 'Barclays Bank UK PLC',
    shortName: 'Barclays',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '20-00-00',
    codeType: 'Sort Code',
    swiftBic: 'BARCGB22',
    clearingRail: 'Faster Payments (FPS) / CHAPS',
    isPopular: true
  },
  {
    id: 'uk_hsbc',
    name: 'HSBC UK Bank PLC',
    shortName: 'HSBC UK',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '40-00-00',
    codeType: 'Sort Code',
    swiftBic: 'MIDLGB22',
    clearingRail: 'Faster Payments (FPS) / CHAPS',
    isPopular: true
  },
  {
    id: 'uk_lloyds',
    name: 'Lloyds Bank PLC',
    shortName: 'Lloyds Bank',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '30-00-00',
    codeType: 'Sort Code',
    swiftBic: 'LOYDGB21',
    clearingRail: 'Faster Payments (FPS) / CHAPS / BACS',
    isPopular: true
  },
  {
    id: 'uk_natwest',
    name: 'National Westminster Bank (NatWest)',
    shortName: 'NatWest',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '60-00-01',
    codeType: 'Sort Code',
    swiftBic: 'NWBKGB2L',
    clearingRail: 'Faster Payments (FPS) / CHAPS',
    isPopular: true
  },
  {
    id: 'uk_rbs',
    name: 'Royal Bank of Scotland (RBS)',
    shortName: 'RBS',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '83-00-00',
    codeType: 'Sort Code',
    swiftBic: 'RBOSGB2L',
    clearingRail: 'Faster Payments (FPS) / CHAPS'
  },
  {
    id: 'uk_santander',
    name: 'Santander UK PLC',
    shortName: 'Santander UK',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '09-01-28',
    codeType: 'Sort Code',
    swiftBic: 'ABBYGB2L',
    clearingRail: 'Faster Payments (FPS) / CHAPS',
    isPopular: true
  },
  {
    id: 'uk_standard_chartered',
    name: 'Standard Chartered Bank PLC',
    shortName: 'Standard Chartered',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '60-91-96',
    codeType: 'Sort Code',
    swiftBic: 'SCBLGB2L',
    clearingRail: 'CHAPS / SWIFT Direct'
  },
  {
    id: 'uk_monzo',
    name: 'Monzo Bank Ltd',
    shortName: 'Monzo',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '04-00-04',
    codeType: 'Sort Code',
    swiftBic: 'MONZGB21',
    clearingRail: 'Faster Payments Instant Rail',
    isPopular: true
  },
  {
    id: 'uk_starling',
    name: 'Starling Bank Ltd',
    shortName: 'Starling Bank',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '60-83-71',
    codeType: 'Sort Code',
    swiftBic: 'SRLNGB22',
    clearingRail: 'Faster Payments Instant Rail',
    isPopular: true
  },
  {
    id: 'uk_nationwide',
    name: 'Nationwide Building Society',
    shortName: 'Nationwide',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '07-00-93',
    codeType: 'Sort Code',
    swiftBic: 'NAWBGB21',
    clearingRail: 'Faster Payments / BACS'
  },
  {
    id: 'uk_halifax',
    name: 'Halifax (Bank of Scotland PLC)',
    shortName: 'Halifax',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '11-00-01',
    codeType: 'Sort Code',
    swiftBic: 'BOFSGB21',
    clearingRail: 'Faster Payments (FPS)'
  },
  {
    id: 'uk_virgin_money',
    name: 'Virgin Money UK PLC (Clydesdale Bank)',
    shortName: 'Virgin Money',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '08-00-54',
    codeType: 'Sort Code',
    swiftBic: 'CLYDEGB2',
    clearingRail: 'Faster Payments (FPS)'
  },
  {
    id: 'uk_metro_bank',
    name: 'Metro Bank PLC',
    shortName: 'Metro Bank',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '23-05-80',
    codeType: 'Sort Code',
    swiftBic: 'MYMBGB2L',
    clearingRail: 'Faster Payments (FPS) / CHAPS'
  },
  {
    id: 'uk_coutts',
    name: 'Coutts & Co (Private Wealth Banking)',
    shortName: 'Coutts',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '18-00-02',
    codeType: 'Sort Code',
    swiftBic: 'COUTGB22',
    clearingRail: 'CHAPS / Private Clearing Rail'
  },
  {
    id: 'uk_revolut',
    name: 'Revolut Bank UK',
    shortName: 'Revolut UK',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '04-00-75',
    codeType: 'Sort Code',
    swiftBic: 'REVOGB21',
    clearingRail: 'Faster Payments Instant Rail'
  },
  {
    id: 'uk_tsb',
    name: 'TSB Bank PLC',
    shortName: 'TSB',
    country: 'UK',
    countryName: 'United Kingdom',
    routingOrSortCode: '77-00-00',
    codeType: 'Sort Code',
    swiftBic: 'TSBSGB21',
    clearingRail: 'Faster Payments (FPS)'
  },

  // ==================== EUROPEAN & GLOBAL INSTITUTIONS ====================
  {
    id: 'eu_deutsche_bank',
    name: 'Deutsche Bank AG',
    shortName: 'Deutsche Bank',
    country: 'EU',
    countryName: 'Germany',
    routingOrSortCode: 'DEUTDEDD',
    codeType: 'SWIFT/BIC',
    swiftBic: 'DEUTDEDD',
    clearingRail: 'SEPA Instant / TARGET2',
    isPopular: true
  },
  {
    id: 'eu_bnp_paribas',
    name: 'BNP Paribas S.A.',
    shortName: 'BNP Paribas',
    country: 'EU',
    countryName: 'France',
    routingOrSortCode: 'BNPAFRPP',
    codeType: 'SWIFT/BIC',
    swiftBic: 'BNPAFRPP',
    clearingRail: 'SEPA Instant / TARGET2',
    isPopular: true
  },
  {
    id: 'eu_ubs',
    name: 'UBS Switzerland AG',
    shortName: 'UBS Switzerland',
    country: 'EU',
    countryName: 'Switzerland',
    routingOrSortCode: 'UBSWCHZH',
    codeType: 'SWIFT/BIC',
    swiftBic: 'UBSWCHZH',
    clearingRail: 'SIC / SWIFT GPI'
  },
  {
    id: 'eu_credit_suisse',
    name: 'Credit Suisse (UBS Group)',
    shortName: 'Credit Suisse',
    country: 'EU',
    countryName: 'Switzerland',
    routingOrSortCode: 'CRESCHZZ',
    codeType: 'SWIFT/BIC',
    swiftBic: 'CRESCHZZ',
    clearingRail: 'SIC / SWIFT GPI'
  },
  {
    id: 'eu_ing',
    name: 'ING Bank N.V.',
    shortName: 'ING Group',
    country: 'EU',
    countryName: 'Netherlands',
    routingOrSortCode: 'INGBNL2A',
    codeType: 'SWIFT/BIC',
    swiftBic: 'INGBNL2A',
    clearingRail: 'SEPA Instant / TARGET2'
  },
  {
    id: 'eu_bbva',
    name: 'Banco Bilbao Vizcaya Argentaria (BBVA)',
    shortName: 'BBVA',
    country: 'EU',
    countryName: 'Spain',
    routingOrSortCode: 'BBVAESMM',
    codeType: 'SWIFT/BIC',
    swiftBic: 'BBVAESMM',
    clearingRail: 'SEPA Instant'
  },
  {
    id: 'global_dbs',
    name: 'DBS Bank Ltd',
    shortName: 'DBS Bank',
    country: 'GLOBAL',
    countryName: 'Singapore',
    routingOrSortCode: 'DBSSSGSG',
    codeType: 'SWIFT/BIC',
    swiftBic: 'DBSSSGSG',
    clearingRail: 'FAST / SWIFT GPI'
  },
  {
    id: 'global_emirates_nbd',
    name: 'Emirates NBD Bank PJSC',
    shortName: 'Emirates NBD',
    country: 'GLOBAL',
    countryName: 'United Arab Emirates',
    routingOrSortCode: 'EBILAEAD',
    codeType: 'SWIFT/BIC',
    swiftBic: 'EBILAEAD',
    clearingRail: 'UAEFTS / SWIFT Direct'
  },
  {
    id: 'global_rbc',
    name: 'Royal Bank of Canada (RBC)',
    shortName: 'RBC',
    country: 'GLOBAL',
    countryName: 'Canada',
    routingOrSortCode: 'ROYCCAT2',
    codeType: 'SWIFT/BIC',
    swiftBic: 'ROYCCAT2',
    clearingRail: 'Lynx / Automated Clearing'
  }
];

export const OTHER_CUSTOM_BANK_ID = 'custom_other_bank';

export interface DispatchNotificationRecord {
  ref: string;
  amountMinor: number;
  currency: string;
  recipientName: string;
  bankName: string;
  accountMasked: string;
  clearingRail: string;
  timestamp: string;
  userEmail: string;
  userPhone: string;
  status: 'SENT' | 'DELIVERED';
}
