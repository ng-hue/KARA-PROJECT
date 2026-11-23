// Correspondence entry rules (S4 US2, SCRUM-210). No database calls, so the
// form and the tests share one copy of the rules.

import { localToday } from "./deadlineFlags.js";

export const DIRECTIONS = [
  { value: "outgoing", label: "Outgoing" },
  { value: "incoming", label: "Incoming" },
];

// Proposed cap; awaits sponsor sign-off (SCRUM-198).
export const SUMMARY_MAX_LENGTH = 600;

// Turns "10/08/2026" into "2026-10-08". Returns null when the text is not a
// real calendar date in MM/DD/YYYY form.
export function parseUsDate(text) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text?.trim() ?? "");
  if (!match) return null;
  const [, m, d, y] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  const iso = `${y}-${m}-${d}`;
  return date.toISOString().slice(0, 10) === iso ? iso : null;
}

// Returns an object of field -> error message. Empty means valid.
// today is YYYY-MM-DD in KARA's timezone; tests pass a fixed date.
export function validateCorrespondence(values, today = localToday()) {
  const errors = {};
  if (!DIRECTIONS.some((d) => d.value === values.direction)) {
    errors.direction = "Choose a direction.";
  }
  const date = parseUsDate(values.correspondence_date);
  if (!values.correspondence_date?.trim()) {
    errors.correspondence_date = "Enter the date on the message.";
  } else if (!date) {
    errors.correspondence_date = "Enter the date as MM/DD/YYYY.";
  } else if (date > today) {
    // A message cannot be dated after it was logged (S5 US9, SCRUM-239).
    errors.correspondence_date = "The date can't be later than today.";
  }
  if (!values.sender?.trim()) errors.sender = "Enter the sender.";
  if (!values.summary?.trim()) {
    errors.summary = "Enter a summary.";
  } else if (values.summary.trim().length > SUMMARY_MAX_LENGTH) {
    errors.summary = `Keep the summary to ${SUMMARY_MAX_LENGTH} characters or fewer.`;
  }
  return errors;
}

// Label for the request list count, S4 US5
// No entries, or a request missing from the counts, reads "No letters yet."
export function correspondenceLabel(count) {
  if (!count) return "No letters yet";
  return count === 1 ? "1 letter" : `${count} letters`;
}
