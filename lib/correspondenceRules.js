// Correspondence entry rules (S4 US2, SCRUM-210). No database calls, so the
// form and the tests share one copy of the rules.

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
export function validateCorrespondence(values) {
  const errors = {};
  if (!DIRECTIONS.some((d) => d.value === values.direction)) {
    errors.direction = "Choose a direction.";
  }
  if (!values.correspondence_date?.trim()) {
    errors.correspondence_date = "Enter the date on the message.";
  } else if (!parseUsDate(values.correspondence_date)) {
    errors.correspondence_date = "Enter the date as MM/DD/YYYY.";
  }
  if (!values.sender?.trim()) errors.sender = "Enter the sender.";
  if (!values.summary?.trim()) {
    errors.summary = "Enter a summary.";
  } else if (values.summary.trim().length > SUMMARY_MAX_LENGTH) {
    errors.summary = `Keep the summary to ${SUMMARY_MAX_LENGTH} characters or fewer.`;
  }
  return errors;
}
