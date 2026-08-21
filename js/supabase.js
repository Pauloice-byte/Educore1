// ============================================================
// EduCore — Supabase Client
// ============================================================

const SUPABASE_URL =
    "https://kioqhgkpfqdhjqidrlwf.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_secret_MKv2UoAThvvlglzjSHpj6Q_Xk04rM_c";


// ============================================================
// CREATE SUPABASE CLIENT
// ============================================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );