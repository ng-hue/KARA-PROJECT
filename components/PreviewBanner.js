import { isSupabaseConfigured } from "@/lib/supabase";

export default function PreviewBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
      Preview mode: showing sample data saved in this browser only. Add the
      Supabase keys to .env.local to use the real database.
    </div>
  );
}
