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
  NOT_SUPPORTED_LABEL,
  NO_STATUTORY_DEADLINE_LABEL,
  calendarDaysBetween,
  deadlineLabel,
} from "@/lib/deadlines";
import { FLAGGABLE_STATUSES, localToday } from "@/lib/deadlineFlags";
import {
  FLAG_FILTERS,
  applyFilters,
  filtersToQuery,
  parseFilters,
  sortForList,
  withDeadlines,
} from "@/lib/requestList";
import StatusBadge from "@/components/StatusBadge";
import { countCorrespondenceByRequest } from "@/lib/correspondence";
import { correspondenceLabel } from "@/lib/correspondenceRules";


const selectClass =
  "mt-1 block rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";

// Colored left edge for flagged rows and cards.
const EDGE = {
  overdue: "shadow-[inset_3px_0_0_#b91c1c]",
  due_soon: "shadow-[inset_3px_0_0_#d97706]",
};

// Plain-language countdown under a flagged deadline. The flag itself still
// comes from getRequestFlag via withDeadlines (risk R7).
function flagLine(flag, date, today) {
  if (!flag || !date) return null;
  const days = calendarDaysBetween(today, date);
  if (flag.key === "overdue") {
    const late = Math.abs(days);
    return { tone: "text-red-700", text: `${late} ${late === 1 ? "day" : "days"} overdue` };
  }
  if (days === 0) return { tone: "text-amber-800", text: "Due today" };
  return { tone: "text-amber-800", text: `Due in ${days} ${days === 1 ? "day" : "days"}` };
}

// Derived from the current rules at read time, so rows saved before the
// rules existed (deadline NULL) still show a deadline.
function Deadline({ request, today }) {
  const info = request.deadlineInfo;
  if (!info) return <span className="text-gray-500">Not sent</span>;
  if (info.kind === "unsupported") return <span className="text-gray-500">{NOT_SUPPORTED_LABEL}</span>;
  if (info.kind === "none") return <span className="text-gray-500">{NO_STATUTORY_DEADLINE_LABEL}</span>;
  if (!info.date) return <span className="text-gray-500">Not reported</span>;
  const line = flagLine(request.flag, info.date, today);
  return (
    <span className="block">
      <span title={deadlineLabel(request.state)} className="whitespace-nowrap">
        {formatDate(info.date)}*
      </span>
      {line ? (
        <span className={`block text-xs font-semibold ${line.tone}`}>{line.text}</span>
      ) : null}
    </span>
  );
}

function Letters({ counts, id }) {
  if (!counts) return <span className="text-gray-500">Not reported</span>;
  if (!counts[id]) return <span className="text-gray-500">{correspondenceLabel(counts[id])}</span>;
  return correspondenceLabel(counts[id]);
}

// Summary tile. With href it works as a one-click filter.
function Stat({ label, value, tone = "", href, selected }) {
  const body = (
    <>
      <span className={`block text-2xl font-semibold leading-tight ${tone}`}>{value}</span>
      <span className="block text-sm text-gray-600">{label}</span>
    </>
  );
  const base = "block rounded-lg border bg-white px-4 py-3 text-left";
  const border = selected ? "border-accent ring-1 ring-accent" : "border-gray-200";
  return href ? (
    <Link href={href} scroll={false} className={`${base} ${border} hover:border-accent`}>
      {body}
    </Link>
  ) : (
    <div className={`${base} ${border}`}>{body}</div>
  );
}

function RequestsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseFilters(searchParams);
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({});

function load() {
  Promise.all([
    listRequests(),
    countCorrespondenceByRequest().catch(() => null),
  ])
    .then(([reqs, c]) => {
      setCounts(c);
      setRequests(reqs);
    })
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

  const today = localToday();
  const all = requests ? sortForList(withDeadlines(requests, today)) : null;
  const rows = all ? applyFilters(all, filters) : null;
  const filtered = Boolean(filters.status || filters.flag);

  const overdue = all ? all.filter((r) => r.flag?.key === "overdue").length : 0;
  const dueSoon = all ? all.filter((r) => r.flag?.key === "due_soon").length : 0;
  const waiting = all ? all.filter((r) => FLAGGABLE_STATUSES.includes(r.status)).length : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
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

      {all && all.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Overdue"
            value={overdue}
            tone={overdue ? "text-red-700" : ""}
            href={`/requests${filtersToQuery({ ...filters, flag: "overdue" })}`}
            selected={filters.flag === "overdue"}
          />
          <Stat
            label="Due soon"
            value={dueSoon}
            tone={dueSoon ? "text-amber-800" : ""}
            href={`/requests${filtersToQuery({ ...filters, flag: "due_soon" })}`}
            selected={filters.flag === "due_soon"}
          />
          <Stat label="Waiting on agency" value={waiting} />
          <Stat
            label="All requests"
            value={all.length}
            href="/requests"
            selected={!filtered}
          />
        </div>
      ) : null}

      <div className="mb-4 mt-6 flex flex-wrap items-end gap-4">
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
        {filtered ? (
          <Link href="/requests" scroll={false} className="pb-2 text-sm text-link underline">
            Clear filters
          </Link>
        ) : null}
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
          <Link href="/requests/new" className="text-link underline">
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
              <li
                key={r.id}
                className={`rounded-lg border border-gray-200 bg-white p-4 ${EDGE[r.flag?.key] || ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium"><Link href={`/requests/${r.id}`} className="text-link hover:underline">{r.title}</Link></p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {r.target_agency}, {r.state}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Date Sent</dt>
                    <dd>{r.date_sent ? formatDate(r.date_sent) : <span className="text-gray-500">Not sent</span>}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Deadline</dt>
                    <dd><Deadline request={r} today={today} /></dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Letters</dt>
                    <dd><Letters counts={counts} id={r.id} /></dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          {/* Desktop layout: table */}
          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Request</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-4 py-3 font-medium">Date Sent</th>
                  <th className="px-4 py-3 font-medium">Deadline</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Letters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="align-top hover:bg-gray-50">
                    <td className={`px-4 py-3 ${EDGE[r.flag?.key] || ""}`}>
                      <Link href={`/requests/${r.id}`} className="font-medium text-link hover:underline">{r.title}</Link>
                      <span className="block text-xs text-gray-500">{r.target_agency}</span>
                    </td>
                    <td className="px-4 py-3">{r.state}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {r.date_sent ? formatDate(r.date_sent) : <span className="text-gray-500">Not sent</span>}
                    </td>
                    <td className="px-4 py-3"><Deadline request={r} today={today} /></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3"><Letters counts={counts} id={r.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-gray-600">{DEADLINE_FOOTNOTE}</p>
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
