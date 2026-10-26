"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { listRequests, resetPreviewData } from "@/lib/requests";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatDate } from "@/lib/format";
import { STATUSES } from "@/lib/constants";
import {
  DEADLINE_FOOTNOTE,
  ESTIMATE_NOTE,
  NOT_SUPPORTED_LABEL,
  deadlineLabel,
} from "@/lib/deadlines";
import { localToday } from "@/lib/deadlineFlags";
import {
  FLAG_FILTERS,
  applyFilters,
  filtersToQuery,
  parseFilters,
  sortForList,
  withDeadlines,
} from "@/lib/requestList";
import StatusBadge from "@/components/StatusBadge";
import FlagBadge from "@/components/FlagBadge";

const selectClass =
  "mt-1 block rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#009B91] focus:outline-none";

// Derived from the current rules at read time, so rows saved before the
// rules existed (deadline NULL) still show a deadline.
function Deadline({ request }) {
  const info = request.deadlineInfo;
  if (!info) return <span className="text-gray-500">Not sent</span>;
  if (info.kind === "unsupported") return <span className="text-gray-500">{NOT_SUPPORTED_LABEL}</span>;
  if (!info.date) return <span className="text-gray-500">Not reported</span>;
  return (
    <span title={deadlineLabel(request.state)}>
      {info.kind === "estimated" ? "Est. " : ""}
      {formatDate(info.date)}*
    </span>
  );
}

function RequestsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseFilters(searchParams);
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");

  function load() {
    listRequests()
      .then(setRequests)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  function handleReset() {
    resetPreviewData();
    load();
  }

  // Filters live in the query string so they survive a page refresh.
  function setFilter(event) {
    const next = { ...filters, [event.target.name]: event.target.value };
    router.replace(`/requests${filtersToQuery(next)}`, { scroll: false });
  }

  const rows = requests
    ? applyFilters(sortForList(withDeadlines(requests, localToday())), filters)
    : null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">All Requests</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overdue first, then by deadline.
          </p>
        </div>
        {!isSupabaseConfigured ? (
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 underline hover:text-gray-900"
          >
            Reset Sample Data
          </button>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <label className="text-sm font-medium text-gray-700">
          Status
          <select name="status" value={filters.status} onChange={setFilter} className={selectClass}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Flag
          <select name="flag" value={filters.flag} onChange={setFilter} className={selectClass}>
            <option value="">All requests</option>
            {FLAG_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 p-4 text-red-800">
          Could not load requests: {error}
        </p>
      ) : !rows ? (
        <p className="text-gray-600">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">
          No requests yet.{" "}
          <Link href="/requests/new" className="text-[#007a72] underline">
            Log the first one
          </Link>
          .
        </p>
      ) : rows.length === 0 ? (
        <p className="text-gray-600">No requests match these filters.</p>
      ) : (
        <>
          {/* Phone layout: one card per request */}
          <ul className="space-y-3 md:hidden">
            {rows.map((r) => (
              <li key={r.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium"><Link href={`/requests/${r.id}`} className="text-[#007a72] hover:underline">{r.title}</Link></p>
                  <div className="flex flex-wrap justify-end gap-1">
                    <FlagBadge flag={r.flag} />
                    <StatusBadge status={r.status} />
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {r.target_agency}, {r.state}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Date Sent</dt>
                    <dd>{formatDate(r.date_sent)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Deadline</dt>
                    <dd><Deadline request={r} /></dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          {/* Desktop layout: table */}
          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-4 py-3 font-medium">Target Agency</th>
                  <th className="px-4 py-3 font-medium">Date Sent</th>
                  <th className="px-4 py-3 font-medium">Deadline</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium"><Link href={`/requests/${r.id}`} className="text-[#007a72] hover:underline">{r.title}</Link></td>
                    <td className="px-4 py-3">{r.state}</td>
                    <td className="px-4 py-3">{r.target_agency}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(r.date_sent)}</td>
                    <td className="whitespace-nowrap px-4 py-3"><Deadline request={r} /></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3"><FlagBadge flag={r.flag} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-gray-600">{DEADLINE_FOOTNOTE}</p>
          <p className="mt-1 text-xs text-gray-600">{ESTIMATE_NOTE}</p>
        </>
      )}
    </div>
  );
}

// useSearchParams needs a Suspense boundary for the production build.
export default function RequestsPage() {
  return (
    <Suspense fallback={<p className="text-gray-600">Loading requests...</p>}>
      <RequestsList />
    </Suspense>
  );
}
