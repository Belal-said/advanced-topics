import "./env.js";
import { createClient } from "@supabase/supabase-js";

/** Admin client: uses the secret key and skips Row Level Security (RLS). Server-only. */
export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
        auth: { persistSession: false, autoRefreshToken: false },
    },
);

/** Per-request client that acts as the signed-in user, so RLS policies apply. */
export function supabaseForUser(accessToken) {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_PUBLISHABLE_KEY,
        {
            global: { headers: { Authorization: `Bearer ${accessToken}` } },
            auth: { persistSession: false, autoRefreshToken: false },
        },
    );
}
