import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// クライアント側用（RLS適用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サーバー側管理用（RLSバイパス）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
