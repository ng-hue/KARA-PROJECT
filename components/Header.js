import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#012929] text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/requests" className="text-lg font-semibold">
          KARA Public Records Tracker
        </Link>
        <nav className="flex gap-2 text-sm">
          <Link href="/requests" className="rounded px-3 py-2 hover:bg-white/10">
            All Requests
          </Link>
          <Link
            href="/requests/new"
            className="rounded bg-[#009B91] px-3 py-2 font-medium hover:bg-[#00877e]"
          >
            New Request
          </Link>
        </nav>
      </div>
    </header>
  );
}
