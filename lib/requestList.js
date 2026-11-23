// Request list sorting and filters (US6: SCRUM-184, SCRUM-185).

import { STATES, STATUSES } from "./constants.js";
import { getDeadlineInfo } from "./deadlines.js";
import { FLAGGABLE_STATUSES, getRequestFlag } from "./deadlineFlags.js";

export const FLAG_FILTERS = [
  { value: "overdue", label: "Overdue" },
  { value: "due_soon", label: "Due Soon" },
];

// List-only filter for requests still waiting on the agency: Sent or
// Acknowledged, the same statuses that can be flagged. It is a shortcut on
// the list page, not a status; it is never stored and is not in STATUSES.
export const WAITING_FILTER = "waiting";

// Adds the derived deadline and flag to each row. Draft rows have no
// deadline, because the request has not been sent.
export function withDeadlines(rows, today) {
  return rows.map((r) => ({
    ...r,
    deadlineInfo:
    r.status === "Drafted"
    ? null
    : getDeadlineInfo(r.state, r.date_sent),
    flag: getRequestFlag({ state: r.state, status: r.status, dateSent: r.date_sent, today }),
  }));
}

// Default sort: overdue first, then by deadline ascending. Rows with no
// deadline go last, newest date sent first.
export function sortForList(rows) {
  const overdueRank = (r) => (r.flag?.key === "overdue" ? 0 : 1);
  return [...rows].sort((a, b) => {
    const rank = overdueRank(a) - overdueRank(b);
    if (rank !== 0) return rank;
    const ad = a.deadlineInfo?.date ?? null;
    const bd = b.deadlineInfo?.date ?? null;
    if (ad && bd && ad !== bd) return ad < bd ? -1 : 1;
    if (ad && !bd) return -1;
    if (!ad && bd) return 1;
    // date_sent is nullable in the live table, so guard against null.
    return (b.date_sent ?? "").localeCompare(a.date_sent ?? "");
  });
}

// Reads filters from the query string. Unknown values are ignored.
export function parseFilters(searchParams) {
  const status = searchParams.get("status");
  const flag = searchParams.get("flag");
  const state = searchParams.get("state");
  return {
    status: STATUSES.includes(status) || status === WAITING_FILTER ? status : "",
    flag: FLAG_FILTERS.some((f) => f.value === flag) ? flag : "",
    state: STATES.some((s) => s.code === state) ? state : "",
  };
}

export function filtersToQuery({ status, flag, state }) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (flag) params.set("flag", flag);
  if (state) params.set("state", state);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function matchesStatus(row, status) {
  if (!status) return true;
  if (status === WAITING_FILTER) return FLAGGABLE_STATUSES.includes(row.status);
  return row.status === status;
}

export function applyFilters(rows, { status, flag, state }) {
  return rows.filter(
    (r) =>
      matchesStatus(r, status) &&
      (!flag || r.flag?.key === flag) &&
      (!state || r.state === state)
  );
}
