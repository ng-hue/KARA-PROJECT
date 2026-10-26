// Request flags (US6, SCRUM-183). The single shared helper for the list
// page and the detail page (risk R7). Neither page computes flag rules on
// its own.
//
// Rules, straight from the sponsor's user story:
//   Overdue   the deadline is before today and status is Sent or Acknowledged.
//   Due soon  the deadline is within the next 7 days and status is Sent or
//             Acknowledged.
//   Fulfilled, Denied, Appealed and Draft are never flagged.
//
// Flags are derived at read time and never stored.
// Pass `today` as YYYY-MM-DD in KARA's local timezone (use localToday), so
// a request does not flip to Overdue early or late because of UTC.

import { addDays, getDeadlineInfo } from "./deadlines.js";

// KARA is based in Minnesota.
export const KARA_TIME_ZONE = "America/Chicago";

export const DUE_SOON_DAYS = 7;

// Only these statuses are ever flagged.
export const FLAGGABLE_STATUSES = ["Sent", "Acknowledged"];

// Today's date as YYYY-MM-DD in KARA's timezone.
export function localToday(now = new Date(), timeZone = KARA_TIME_ZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// tone drives the badge color: urgent, warning.
export const FLAG_DEFINITIONS = {
  overdue:  { label: "Overdue",  tone: "urgent" },
  due_soon: { label: "Due Soon", tone: "warning" },
};

// Returns the request's flag, or null. Estimated deadlines (AZ, MN) flag
// the same way, with "(Est.)" in the label so staff know the date is not
// statutory.
export function getRequestFlag({ state, status, dateSent, today, adjustments = [] }) {
  if (!FLAGGABLE_STATUSES.includes(status)) return null;
  const info = getDeadlineInfo(state, dateSent, adjustments);
  if (!info.date) return null;

  let key = null;
  if (info.date < today) key = "overdue";
  else if (info.date <= addDays(today, DUE_SOON_DAYS, "calendar")) key = "due_soon";
  if (!key) return null;

  const def = FLAG_DEFINITIONS[key];
  const suffix = info.kind === "estimated" ? " (Est.)" : "";
  return { key, tone: def.tone, label: `${def.label}${suffix}` };
}
