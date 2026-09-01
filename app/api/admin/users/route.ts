import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(req: Request) {
  try {
    if (!supabase) {
      return Response.json({
        success: true,
        users: [],
        count: 0
      });
    }

    // Query users list from Supabase 'users' table
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Users Select Notice]:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      users: users || [],
      count: users?.length || 0
    });
  } catch (error: any) {
    console.error('[Supabase Get Users Error]:', error);
    return Response.json({ error: error?.message || 'Failed to fetch users' }, { status: 500 });
  }
}
