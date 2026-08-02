import { createClient } from '@supabase/supabase-js';

// Server-only client. Uses the service_role ("secret") key, which bypasses
// RLS — this file must never be imported from src/ (the Vite/browser build).
// Authorization for these operations is enforced in server/services instead.
const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set for the API to run.');
}

export const supabaseAdmin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
