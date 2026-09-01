import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://mock-project.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'anon-key-placeholder';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, usernameOrEmail, identifier, username, password } = body;
    const loginEmail = (email || usernameOrEmail || identifier || username || '').trim().toLowerCase();

    if (!loginEmail || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
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
