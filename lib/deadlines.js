// Statutory response deadlines (US4).
//
// Sponsor decisions applied (10/25/2026):
//   - States in scope: AZ, CA, ME, MN, TX. Every other state returns
//     "State Not Supported Yet". To add one, follow docs/adding-a-state.md.
//   - Counting starts the day after the date sent. Every displayed deadline
//     carries an asterisk pointing to DEADLINE_FOOTNOTE, because a mailed
//     request may reach the agency days later.
//   - Business days skip weekends only. Holidays are ignored.
//   - Agency extensions are not tracked in the UI this semester, but
//     getDeadlineInfo accepts adjustments so they can be added later
//     without changing this file's callers.
//   - States with "promptly" or "reasonable time" language get an estimated
//     deadline: the average of the fixed-deadline states, in business days.
//   - Overdue and due-soon rules live in lib/deadlineFlags.js (SCRUM-183).
//
// US4 owner: Angela Iweka.

export const NOT_SUPPORTED_LABEL = "State Not Supported Yet";

export const DEADLINE_FOOTNOTE =
  "* Counted from the day after the date sent. A request sent by mail may " +
  "reach the agency a few days later, so the legal deadline can fall after " +
  "the date shown.";

// Rule fields:
//   deadlineType  "fixed"  statute sets a number of days
//                 "prompt" statute says "promptly", "reasonable time" or similar
//                 "none"   statute sets no response timing at all
//   days, dayType only for "fixed"; dayType is "calendar" or "business"
//   measures      "acknowledgment", "determination" or "production"
//   extension     statutory extension the agency may take, or null
export const STATE_DEADLINE_RULES = {
  AZ: {
    statuteName: "Arizona Public Records Law (A.R.S. Title 39, Chapter 1, Article 2)",
    deadlineType: "prompt",
    days: null,
    dayType: null,
    measures: "production",
    extension: null,
    statutoryLanguage: "promptly",
    citation: "A.R.S. § 39-121.01(D)(1), (E)",
    sourceUrl: "https://www.azleg.gov/ars/39/00121-01.htm", // verify link opens
  },
  CA: {
    statuteName: "California Public Records Act (Gov. Code §§ 7920.000-7931.000)",
    deadlineType: "fixed",
    days: 10,
    dayType: "calendar",
    measures: "determination",
    extension: { days: 14, dayType: "calendar", note: "Agency may extend by written notice" },
    statutoryLanguage: null,
    citation: "Cal. Gov. Code § 7922.535(a)",
    sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=7922.535", // verify link opens
  },
  ME: {
    statuteName: "Maine Freedom of Access Act (1 M.R.S. §§ 400-414)",
    deadlineType: "fixed",
    days: 5,
    dayType: "business",
    measures: "acknowledgment",
    extension: null,
    statutoryLanguage: null,
    citation: "1 M.R.S. § 408-A(3), (4)",
    sourceUrl: "https://legislature.maine.gov/statutes/1/title1sec408-A.html", // verify link opens
  },
  MN: {
    statuteName: "Minnesota Government Data Practices Act (Minn. Stat. ch. 13)",
    deadlineType: "prompt",
    days: null,
    dayType: null,
    measures: "production",
    extension: null,
    statutoryLanguage: "appropriate and prompt manner; within a reasonable time",
    citation: "Minn. Stat. § 13.03, subd. 2",
    sourceUrl: "https://www.revisor.mn.gov/statutes/?id=13.03",
  },
  TX: {
    statuteName: "Texas Public Information Act (Tex. Gov't Code ch. 552)",
    deadlineType: "fixed",
    days: 10,
    dayType: "business",
    measures: "production",
    extension: { days: null, dayType: null, note: "Agency may certify in writing and set a later date" },
    statutoryLanguage: null,
    citation: "Tex. Gov't Code § 552.221(a), (d)",
    sourceUrl: "https://statutes.capitol.texas.gov/Docs/GV/htm/GV.552.htm#552.221",
  },
};

export const SUPPORTED_STATES = Object.keys(STATE_DEADLINE_RULES);

// ---------- Date helpers (UTC, date-only, YYYY-MM-DD) ----------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDateString(value) {
  return DATE_RE.test(value ?? "");
}

function toDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function isWeekend(date) {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

// Adds days starting the day after dateStr. Weekends skipped for business
// days. Holidays ignored by sponsor decision.
export function addDays(dateStr, days, dayType) {
  const date = toDate(dateStr);
  if (dayType === "calendar") {
    date.setUTCDate(date.getUTCDate() + days);
    return toDateString(date);
  }
  let added = 0;
  while (added < days) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (!isWeekend(date)) added += 1;
  }
  return toDateString(date);
}

// Business days after `from`, up to and including `to`.
// Negative when `to` is before `from`. 0 when they are the same day.
export function businessDaysBetween(from, to) {
  if (from === to) return 0;
  if (to < from) return -businessDaysBetween(to, from);
  const cursor = toDate(from);
  const end = toDate(to);
  let count = 0;
  while (cursor < end) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    if (!isWeekend(cursor)) count += 1;
  }
  return count;
}

function calendarDaysBetween(from, to) {
  return Math.round((toDate(to) - toDate(from)) / 86400000);
}

// ---------- Estimated deadline for "prompt" and "none" states ----------

// Which fixed deadlines feed the average. null means all of them.
// Set to ["production"] to average only deadlines that measure production.
export const ESTIMATE_SOURCE_MEASURES = null;

function toBusinessDays(rule) {
  return rule.dayType === "business" ? rule.days : (rule.days * 5) / 7;
}

function buildEstimatedRule() {
  const sources = Object.entries(STATE_DEADLINE_RULES).filter(
    ([, r]) =>
      r.deadlineType === "fixed" &&
      r.days &&
      r.dayType &&
      (!ESTIMATE_SOURCE_MEASURES || ESTIMATE_SOURCE_MEASURES.includes(r.measures))
  );
  if (sources.length === 0) return null;
  const total = sources.reduce((sum, [, r]) => sum + toBusinessDays(r), 0);
  const average = total / sources.length;
  return {
    days: Math.round(average),
    dayType: "business",
    averageBeforeRounding: average,
    basedOn: sources.map(([code]) => code),
  };
}

// Recalculated whenever a fixed-deadline state is added or changed.
// With CA, ME and TX: (7.14 + 5 + 10) / 3 = 7.38, rounded to 7 business days.
export const ESTIMATED_RULE = buildEstimatedRule();

// ---------- Adjustments (pending out days) ----------
//
// Not stored or shown in the UI this semester. When added, each request can
// carry a list of these, applied in order after the base deadline:
//   { type: "extend", days, dayType, reason }   agency takes extra days
//   { type: "pause",  from, to, reason }        clock stopped, e.g. agency
//                                               asked a clarifying question
//   { type: "set",    date, reason }            agency names its own date
function applyAdjustments(baseDate, adjustments) {
  let date = baseDate;
  const applied = [];
  for (const adj of adjustments ?? []) {
    if (adj.type === "extend" && adj.days > 0 && adj.dayType) {
      date = addDays(date, adj.days, adj.dayType);
    } else if (adj.type === "pause" && isDateString(adj.from) && isDateString(adj.to) && adj.to > adj.from) {
      date = addDays(date, calendarDaysBetween(adj.from, adj.to), "calendar");
    } else if (adj.type === "set" && isDateString(adj.date)) {
      date = adj.date;
    } else {
      continue; // malformed adjustments are ignored, never guessed at
    }
    applied.push(adj);
  }
  return { date, applied };
}

// ---------- Main entry point ----------
//
// Returns:
//   kind       "statutory"    fixed deadline from statute
//              "estimated"    "prompt"/"none" state, using ESTIMATED_RULE
//              "not_sent"     no valid date sent (Draft)
//              "unsupported"  state not in STATE_DEADLINE_RULES
//   date       YYYY-MM-DD after adjustments, or null
//   baseDate   YYYY-MM-DD before adjustments, or null
//   measures   what the deadline measures, or null
//   adjustments  the adjustments that were applied
//   rule       the state's rule, or null
export function getDeadlineInfo(state, dateSent, adjustments = []) {
  const rule = STATE_DEADLINE_RULES[state] ?? null;
  const empty = { date: null, baseDate: null, adjustments: [] };
  if (!rule) return { kind: "unsupported", measures: null, rule: null, ...empty };
  if (!isDateString(dateSent)) return { kind: "not_sent", measures: rule.measures, rule, ...empty };

  let kind;
  let baseDate;
  if (rule.deadlineType === "fixed" && rule.days && rule.dayType) {
    kind = "statutory";
    baseDate = addDays(dateSent, rule.days, rule.dayType);
  } else if (ESTIMATED_RULE) {
    kind = "estimated";
    baseDate = addDays(dateSent, ESTIMATED_RULE.days, ESTIMATED_RULE.dayType);
  } else {
    return { kind: "estimated", measures: rule.measures, rule, ...empty };
  }

  const { date, applied } = applyAdjustments(baseDate, adjustments);
  return { kind, date, baseDate, measures: rule.measures, adjustments: applied, rule };
}

// The value saved to requests.deadline: the statutory date, or null.
// Estimated deadlines are derived at read time with getDeadlineInfo and
// never stored, so the column never holds a guess.
// null is never "zero days"; show the label from deadlineLabel instead.
export function calculateDeadline(state, dateSent, adjustments = []) {
  const info = getDeadlineInfo(state, dateSent, adjustments);
  return info.kind === "statutory" ? info.date : null;
}

export const ESTIMATE_NOTE =
  "Est. marks a state whose law sets no fixed number of days. The date " +
  "uses the average of the fixed-deadline states and is not a legal deadline.";

const MEASURE_LABELS = {
  acknowledgment: "To Acknowledge",
  determination: "To Decide",
  production: "To Respond",
};

// Short rule label for a state, with the asterisk for DEADLINE_FOOTNOTE.
export function deadlineLabel(state) {
  const rule = STATE_DEADLINE_RULES[state];
  if (!rule) return NOT_SUPPORTED_LABEL;
  let base;
  if (rule.deadlineType === "fixed") {
    base = `${rule.days} ${rule.dayType === "business" ? "Business" : "Calendar"} Days`;
  } else if (ESTIMATED_RULE) {
    base = `Estimated ${ESTIMATED_RULE.days} Business Days`;
  } else {
    return "No Fixed Deadline";
  }
  const measure = MEASURE_LABELS[rule.measures];
  return `${measure ? `${base} ${measure}` : base}*`;
}