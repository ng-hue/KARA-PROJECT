// Request list sorting and filters (US6: SCRUM-184, SCRUM-185).

import { STATUSES } from "./constants.js";
import { getDeadlineInfo } from "./deadlines.js";
import { getRequestFlag } from "./deadlineFlags.js";

export const FLAG_FILTERS = [
  { value: "overdue", label: "Overdue" },
  { value: "due_soon", label: "Due Soon" },
];

// Adds the derived deadline and flag to each row. Draft rows have no
// deadline, because the request has not been sent.
export function withDeadlines(rows, today) {
  return rows.map((r) => ({
    ...r,
    deadlineInfo: r.status === "Draft" ? null : getDeadlineInfo(r.state, r.date_sent),
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
  return {
    status: STATUSES.includes(status) ? status : "",
    flag: FLAG_FILTERS.some((f) => f.value === flag) ? flag : "",
  };
}

export function filtersToQuery({ status, flag }) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (flag) params.set("flag", flag);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function applyFilters(rows, { status, flag }) {
  return rows.filter(
    (r) => (!status || r.status === status) && (!flag || r.flag?.key === flag)
  );
}
