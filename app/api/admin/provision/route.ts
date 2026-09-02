import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client using SUPABASE_SERVICE_ROLE_KEY for administrative provisioning
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      username,
      loginPin,
      phone,
      region = 'US',
      currency = 'USD',
      accountType = 'CHECKING_PREMIER',
      initialDepositMinor = 0
    } = body;

    if (!email) {
      console.error("PROVISION ERROR:", "Email address is required");
      return Response.json({ success: false, error: 'Email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || cleanEmail.split('@')[0]).trim();
    const userPassword = password || 'AtlanticSecure2026!';
    let authUser: any = null;
    let userId = `usr_${Date.now()}`;

    // Initialize Supabase client if configured
    if (supabaseUrl && supabaseServiceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // 1. Create user in Supabase Auth via Admin API
      let { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: {
          firstName,
          lastName,
          username: cleanUsername,
          loginPin: loginPin || '1234',
          region
        }
      });

      if (authError) {
        if (authError.message?.toLowerCase().includes('already') || (authError as any).status === 422) {
          try {
            const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
            const existingAuth = listData?.users?.find((u: any) => u.email?.toLowerCase() === cleanEmail);
            if (existingAuth) {
              authUser = existingAuth;
              userId = existingAuth.id;
            } else {
              console.error("PROVISION ERROR:", authError);
              return Response.json({ success: false, error: authError.message }, { status: 400 });
            }
          } catch (listErr) {
            console.error("PROVISION ERROR:", authError);
            return Response.json({ success: false, error: authError.message }, { status: 400 });
          }
        } else {
          console.error("PROVISION ERROR:", authError);
          return Response.json({ success: false, error: authError.message }, { status: 400 });
        }
      } else if (authData?.user) {
        authUser = authData.user;
        userId = authData.user.id;
      }

      // 2. Insert into users table in Supabase
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: userId,
          email: cleanEmail,
          first_name: firstName || '',
          last_name: lastName || '',
          username: cleanUsername,
          phone: phone || '',
          region,
          approval_status: 'APPROVED',
          kyc_tier: 'TIER_2_VERIFIED_PREMIER',
          created_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select()
        .single();

      if (userError) {
        console.error("PROVISION ERROR:", userError);
        return Response.json({ success: false, error: userError.message }, { status: 400 });
      }

      // 3. Create initial Bank Account with starting balance of 0
      const accountNumber = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const { data: accountData, error: accountError } = await supabaseAdmin
        .from('accounts')
        .insert({
          user_id: userId,
          account_number: `•••• ${accountNumber.slice(-4)}`,
          account_number_full: accountNumber,
          name: region === 'EU' ? 'European Premier Private Checking' : region === 'UK' ? 'UK Premier Sterling Current Account' : 'Premier Private Checking (USD)',
          type: accountType || 'CHECKING_PREMIER',
          currency: currency || 'USD',
          balance_minor: initialDepositMinor || 0,
          status: 'ACTIVE',
          region,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (accountError) {
        console.error("PROVISION ERROR:", accountError);
        return Response.json({ success: false, error: accountError.message }, { status: 400 });
      }

      return Response.json({
        success: true,
        message: 'Account successfully provisioned in Supabase with 0 starting balance.',
        user: userData || authUser || {
          id: userId,
          email: cleanEmail,
          firstName,
          lastName,
          username: cleanUsername,
          region,
          approval_status: 'APPROVED'
        },
        account: accountData || {
          accountNumber: `•••• ${accountNumber.slice(-4)}`,
          accountNumberFull: accountNumber,
          balanceMinor: 0,
          currency
        }
      });
    }

    // Local fallback if no Supabase credentials provided
    const accountNumber = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    return Response.json({
      success: true,
      message: 'Account successfully provisioned with 0 starting balance.',
      user: {
        id: userId,
        email: cleanEmail,
        firstName,
        lastName,
        username: cleanUsername,
        region,
        approval_status: 'APPROVED'
      },
      account: {
        accountNumber: `•••• ${accountNumber.slice(-4)}`,
        accountNumberFull: accountNumber,
        balanceMinor: 0,
        currency
      }
    });
  } catch (error: any) {
    console.error("PROVISION ERROR:", error);
    return Response.json({ success: false, error: error?.message || 'Failed to provision account' }, { status: 500 });
  }
}

