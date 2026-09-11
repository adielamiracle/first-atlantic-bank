# First Atlantic Bank & Trust

**Production Domain:** [https://firstatlanticbank.vercel.app](https://firstatlanticbank.vercel.app)

A mobile-first digital banking platform engineered for US, UK, and European banking operations. Inspired by top-tier consumer fintechs (Chime, Neza) and institutional banking standards (Bank of America), First Atlantic Bank & Trust combines a fast mobile user experience with a server-side double-entry ledger, multi-currency accounts, real-time transfer rails, and full cloud persistence on Supabase PostgreSQL.

---

## 🌟 Key Highlights & Features

### 1. Mobile-First Customer Dashboard (`/pages/Dashboard.jsx`)
- **Header**: User avatar / profile initial indicator, dynamic greeting (`Welcome back, [username]`), and instant notification center.
- **Hero Balance Card**: Centered `$53,030.00` available balance display with 1-tap **Send Money** and **Add Money** actions.
- **Supabase Cloud Sync Pill**: Real-time status indicator showing synchronization of ledger data, accounts, beneficiaries, and document vaults.
- **Quick Action Grid**: 4 essential fintech actions:
  - 🚀 **Transfer**: Seamless multi-step payment engine
  - 💳 **Pay Bills**: Utility, telecom, and institutional merchant payments
  - 📄 **Statements**: PDF & cryptographic statement generators
  - 🎧 **Support**: Institutional concierge and fraud escalation desk
- **Recent Activity**: Clean transaction feed with beneficiary avatars, timestamps, negative/positive values, and green Completed badges.

### 2. 4-Page Institutional Transfer Flow
- **Page 1 (`/transfer/amount`)**: Large `$ 0.00` keypad input, live available balance display (`$53,030.00`), quick amount chips (`$100`, `$250`, `$500`, `$1,000`), and funds validation.
- **Page 2 (`/transfer/beneficiary`)**:
  - **Worldwide Bank Directory**: Search any bank in the US (Chase, Wells Fargo, BofA, Citi), UK (HSBC, Barclays, Lloyds, NatWest, Monzo, Revolut), Europe (BNP Paribas, Deutsche Bank, Santander, ING, UBS), and across 190+ countries with SWIFT/BIC formats.
  - **Saved Beneficiaries**: Instant 1-tap selection cards with avatar, bank name, and account last digits.
  - **New Beneficiary Form**: Add recipient name, account/IBAN, bank selection, and automatically save to Supabase DB for future transfers.
- **Page 3 (`/transfer/review`)**: Summary card verifying recipient, destination bank, zero-fee pledge (`$0.00`), settled amount, and source account (`Savings ••••7461`).
- **Page 4 (`/transfer/authorize`)**: 6-digit institutional security PIN authorization keypad with real-time feedback and animated payment settlement.
- **Receipt (`/transfer/success`)**: Institutional payment certificate with copyable Transaction ID, TX date, downloadable receipt, and one-tap return to dashboard.

### 3. Complete Cloud Persistence with Supabase
All state is mirrored directly to PostgreSQL on Supabase, ensuring zero data loss across sessions and devices:
- **Core Tables**:
  - `users`: Customer profiles, authentication credentials, and tiers
  - `accounts`: Multi-currency checking, savings, and investment accounts
  - `transactions`: Double-entry immutable ledger entries
  - `cards`: Virtual & physical debit cards with spending limits
  - `beneficiaries`: Saved transfer recipients and routing codes
  - `applications`: KYC/AML account opening dossiers and passport scans
  - `receiving_accounts`: Sovereign treasury deposit routing accounts
  - `wise_transfers`: Cross-border foreign exchange orders
  - `support_cases`: Priority customer care tickets
  - `audit_logs`: Cryptographic audit trails with signature hashes
- **File Storage**: Uploaded identity documents and passports backed up to the `fab-documents` Supabase storage bucket.

### 4. Institutional Admin Suite
- Real-time customer balance adjustment and credit/debit facility
- KYC applicant approval and document inspection dossier
- Comprehensive audit journal and compliance reporting
- Dedicated **Cloud DB & Domain** tab for monitoring Supabase synchronization and domain status.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run dev server (Express backend + Vite frontend)
npm run dev

# 3. Access local preview
http://localhost:3000
```

---

## 🌐 Production Domain & Deployment

- **Custom Domain:** `https://firstatlanticbank.vercel.app`
- **TLS/SSL:** TLS 1.3 Institutional Grade
- **Routing:** Anycast Edge Delivery with PWA mobile offline support.

---

## 📦 Git & GitHub Publishing

To publish this repository to your GitHub account:

```bash
# Add your remote repository URL
git remote add origin https://github.com/YOUR_USERNAME/first-atlantic-bank.git

# Push main branch
git branch -M main
git push -u origin main
```
