-- ============================================================================
-- FIRST ATLANTIC BANK — COMPLETE SUPABASE DATABASE & STORAGE SCHEMA
-- ============================================================================
-- Execute this entire script in your Supabase project's SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  dial_code TEXT,
  date_of_birth TEXT,
  nationality TEXT,
  passport_number TEXT,
  passport_photo TEXT,
  login_pin TEXT,
  ssn_masked TEXT,
  national_insurance_masked TEXT,
  region TEXT DEFAULT 'US',
  approval_status TEXT DEFAULT 'APPROVED',
  kyc_tier TEXT DEFAULT 'TIER_2_VERIFIED_PREMIER',
  security_score INTEGER DEFAULT 95,
  address JSONB DEFAULT '{}'::jsonb,
  profile_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BANK ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  account_number TEXT,
  account_number_full TEXT,
  routing_number TEXT,
  sort_code TEXT,
  iban TEXT,
  swift_bic TEXT,
  name TEXT,
  type TEXT,
  currency TEXT DEFAULT 'USD',
  balance_minor BIGINT DEFAULT 0,
  available_balance_minor BIGINT DEFAULT 0,
  pending_hold_minor BIGINT DEFAULT 0,
  interest_rate_apy NUMERIC DEFAULT 0.0,
  credit_limit_minor BIGINT DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  region TEXT DEFAULT 'US',
  opened_date TEXT,
  daily_transfer_limit_minor BIGINT DEFAULT 50000000,
  statement_cycle_day INTEGER DEFAULT 28,
  account_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BANK CARDS TABLE
CREATE TABLE IF NOT EXISTS public.cards (
  id TEXT PRIMARY KEY,
  account_id TEXT,
  user_id TEXT,
  card_number_masked TEXT,
  card_number_full TEXT,
  card_holder_name TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  cvv TEXT,
  card_type TEXT DEFAULT 'DEBIT_VISA_SIGNATURE',
  status TEXT DEFAULT 'ACTIVE',
  is_virtual BOOLEAN DEFAULT FALSE,
  card_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRANSACTIONS & DOUBLE-ENTRY LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  transaction_id TEXT,
  account_id TEXT,
  user_id TEXT,
  direction TEXT,
  amount_minor BIGINT,
  currency TEXT DEFAULT 'USD',
  balance_after_minor BIGINT,
  description TEXT,
  category TEXT,
  counterparty TEXT,
  status TEXT DEFAULT 'SETTLED',
  channel TEXT DEFAULT 'ONLINE',
  reference_number TEXT,
  created_timestamp TIMESTAMPTZ DEFAULT NOW(),
  effective_timestamp TIMESTAMPTZ DEFAULT NOW(),
  settled_timestamp TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. ACCOUNT ONBOARDING APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id TEXT PRIMARY KEY,
  reference_number TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  region TEXT,
  currency TEXT,
  status TEXT DEFAULT 'PENDING',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by_admin_id TEXT,
  reviewed_by_admin_name TEXT,
  created_user_id TEXT,
  provisioned_account_number TEXT,
  provisioned_routing_number TEXT,
  data JSONB DEFAULT '{}'::jsonb
);

-- 6. FILES, DOCUMENTS & PHOTO STORAGE TABLE
CREATE TABLE IF NOT EXISTS public.files (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  file_name TEXT,
  file_url TEXT,
  content_type TEXT,
  file_size BIGINT,
  data_base64 TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_name TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 8. SUPPORT CASES TABLE
CREATE TABLE IF NOT EXISTS public.support_cases (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  subject TEXT,
  category TEXT,
  priority TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 9. FINANCIAL ADJUSTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.financial_adjustments (
  id TEXT PRIMARY KEY,
  account_id TEXT,
  user_id TEXT,
  amount_minor BIGINT,
  reason TEXT,
  admin_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 10. ACTIVATION & KYC REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.activation_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  account_id TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT,
  notes TEXT,
  data JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- DISABLE ROW LEVEL SECURITY (RLS) FOR FULL SERVER / API COMPATIBILITY
-- ============================================================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.files DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_adjustments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_requests DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STORAGE BUCKET CREATION FOR PUBLIC & SECURE ASSETS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true), ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Grant public read access to storage uploads if storage RLS is enabled
CREATE POLICY "Public Uploads Access" ON storage.objects FOR SELECT USING (bucket_id = 'uploads' OR bucket_id = 'documents');
CREATE POLICY "Public Uploads Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' OR bucket_id = 'documents');
CREATE POLICY "Public Uploads Update" ON storage.objects FOR UPDATE USING (bucket_id = 'uploads' OR bucket_id = 'documents');
CREATE POLICY "Public Uploads Delete" ON storage.objects FOR DELETE USING (bucket_id = 'uploads' OR bucket_id = 'documents');
