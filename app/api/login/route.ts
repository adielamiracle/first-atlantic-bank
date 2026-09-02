import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, usernameOrEmail, identifier, username, password } = body;
    const loginEmail = (email || usernameOrEmail || identifier || username || '').trim().toLowerCase();

    if (!loginEmail || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!supabase) {
      return Response.json({ error: 'Supabase authentication service is not configured' }, { status: 503 });
    }

    // 1. Authenticate credentials with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 401 });
    }

    // 2. Fetch linked user profile from 'users' table in Supabase
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', loginEmail)
      .maybeSingle();

    if (profileError) {
      console.warn('[Supabase profile query notice]:', profileError.message);
    }

    return Response.json({
      success: true,
      token: data.session?.access_token || `session_${data.user.id}`,
      session: data.session,
      user: userProfile || {
        id: data.user.id,
        email: data.user.email,
        ...data.user.user_metadata
      },
      message: 'Successfully authenticated with Supabase.'
    });
  } catch (error: any) {
    console.error('[Supabase Login Error]:', error);
    return Response.json({ error: error?.message || 'Authentication error occurred' }, { status: 500 });
  }
}
