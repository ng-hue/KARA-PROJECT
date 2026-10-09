import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// True when both keys are present in .env.local (or in Netlify).
// When false, the app runs in preview mode with sample data.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client = null;

export function getSupabase() {
  if (!isSupabaseConfigured) {
    const missing = [
      !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
      !supabaseAnonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ].filter(Boolean);
    throw new Error(
      `Missing Supabase environment variable(s): ${missing.join(", ")}. ` +
        "Copy .env.example to .env.local and fill in the values."
    );
  }
  if (!client) client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
