"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setError("");
    setSigningOut(true);
    try {
      const { error: signOutError } = await getSupabase().auth.signOut();
      if (signOutError) {
        setError(`Could not sign out: ${signOutError.message}`);
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch (signOutError) {
      setError(`Could not sign out: ${signOutError.message}`);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="bg-[#012929] text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/requests" className="text-lg font-semibold">
          KARA Public Records Tracker
        </Link>
        {pathname === "/login" ? null : (
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/requests" className="rounded px-3 py-2 hover:bg-white/10">
              All Requests
            </Link>
            <Link
              href="/requests/new"
              className="rounded bg-[#009B91] px-3 py-2 font-medium hover:bg-[#00877e]"
            >
              New Request
            </Link>
            {isSupabaseConfigured ? (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded px-3 py-2 hover:bg-white/10 disabled:opacity-60"
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            ) : null}
          </nav>
        )}
      </div>
      {error ? <p role="alert" className="mx-auto max-w-5xl px-4 pb-3 text-sm text-red-200">{error}</p> : null}
    </header>
  );
}
