// ============================================================
// EduCore — Supabase Client
// ============================================================

const SUPABASE_URL =
    "https://kioqhgkpfqdhjqidrlwf.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_ZDAJmFtSl9WNGVlZPyvngA_ZWiv_Q4g";


// ============================================================
// CREATE SUPABASE CLIENT
// ============================================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );
