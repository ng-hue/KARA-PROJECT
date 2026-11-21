// Statutory response deadlines (US4).
//
// Sponsor decisions applied (10/25/2026, updated for Sprint 5 on 11/10/2026):
//   - States in scope: AK, AZ, CA, FL, HI, ME, MN, TX. Every other state
//     returns "State Not Supported Yet". To add one, follow
//     docs/adding-a-state.md. Rules are entered as the sponsor supplies them;
//     the team does not research state law (S5 US7).
//   - Counting starts the day after the date sent. Every displayed deadline
//     carries an asterisk pointing to DEADLINE_FOOTNOTE, because a mailed
//     request may reach the agency days later.
//   - Business days skip weekends only. Holidays are ignored.
//   - Agency extensions are not tracked in the UI this semester, but
//     getDeadlineInfo accepts adjustments so they can be added later
//     without changing this file's callers.
//   - States with "promptly" or "reasonable time" language (AZ, FL, MN) have
//     no statutory deadline: they show "No statutory deadline", store no
//     date, and are never flagged. The Sprint 3 estimated average is removed.
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
  // AK, FL and HI: entered exactly as the sponsor supplied them in writing
  // (email to Angela Iweka, 11/10/2026, S5 US7). Not researched by the team.
  AK: {
    statuteName: "Alaska Public Records Act (AS 40.25.100 to 40.25.295) and regulations 2 AAC 96.100 to 96.900",
    deadlineType: "fixed",
    days: 10,
    dayType: "business", // the regulation says "working days"
    measures: "production",
    extension: {
      days: 10,
      dayType: "business",
      note: "Agency may extend once by written notice sent within the initial 10 working days (2 AAC 96.325(d))",
    },
    statutoryLanguage: null,
    citation: "2 AAC 96.325(a), (d)",
    sourceUrl: "https://www.law.alaska.gov/doclibrary/APRA.html",
  },
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
  FL: {
    statuteName: "Florida Public Records Act (Chapter 119, Florida Statutes)",
    deadlineType: "prompt",
    days: null,
    dayType: null,
    measures: "production",
    extension: null,
    statutoryLanguage:
      "\"promptly acknowledge requests for public records and respond to such requests in good faith\" " +
      "(section 119.07(1)(c)). The Florida Supreme Court has read the statute to allow only the limited " +
      "reasonable time needed to retrieve the record and remove exempt portions (Tribune Co. v. Cannella, " +
      "458 So. 2d 1075 (Fla. 1984)).",
    citation: "Fla. Stat. section 119.07(1)(c)",
    // The sponsor asked for the section 119.07 page on the Florida
    // Legislature's statutes site but did not give its address. This is the
    // Attorney General page she cited; replace it once she confirms the link.
    sourceUrl: "https://www.myfloridalegal.com/node/2857",
  },
  HI: {
    statuteName: "Uniform Information Practices Act (HRS chapter 92F) and Hawaii Administrative Rules chapter 2-71",
    deadlineType: "fixed",
    days: 10,
    dayType: "business",
    measures: "production",
    extension: {
      days: 10,
      dayType: "business",
      note: "If the agency sends a written acknowledgment of extenuating circumstances within the first 10 business days, its notice may come within 20 business days of receipt, with disclosure 5 business days after notice (HAR 2-71-13, 2-71-15)",
    },
    statutoryLanguage: null,
    citation: "HAR 2-71-13(a)",
    sourceUrl: "https://ags.hawaii.gov/oip/uipa-rules/",
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

export function calendarDaysBetween(from, to) {
  return Math.round((toDate(to) - toDate(from)) / 86400000);
}

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
//              "none"         "prompt"/"none" state: no statutory deadline,
//                             no date is computed (S5 US7)
//              "not_sent"     no valid date sent (Drafted)
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

  if (!(rule.deadlineType === "fixed" && rule.days && rule.dayType)) {
    return { kind: "none", measures: rule.measures, rule, ...empty };
  }

  const baseDate = addDays(dateSent, rule.days, rule.dayType);
  const { date, applied } = applyAdjustments(baseDate, adjustments);
  return { kind: "statutory", date, baseDate, measures: rule.measures, adjustments: applied, rule };
}

// The value saved to requests.deadline: the statutory date, or null.
// null is never "zero days"; show the label from deadlineLabel instead.
export function calculateDeadline(state, dateSent, adjustments = []) {
  const info = getDeadlineInfo(state, dateSent, adjustments);
  return info.kind === "statutory" ? info.date : null;
}

// Shown wherever a "prompt" or "none" state would show a date (S5 US7).
export const NO_STATUTORY_DEADLINE_LABEL = "No statutory deadline";

const MEASURE_LABELS = {
  acknowledgment: "To Acknowledge",
  determination: "To Decide",
  production: "To Respond",
};

// Short rule label for a state, with the asterisk for DEADLINE_FOOTNOTE.
export function deadlineLabel(state) {
  const rule = STATE_DEADLINE_RULES[state];
  if (!rule) return NOT_SUPPORTED_LABEL;
  if (rule.deadlineType !== "fixed") return NO_STATUTORY_DEADLINE_LABEL;
  const base = `${rule.days} ${rule.dayType === "business" ? "Business" : "Calendar"} Days`;
  const measure = MEASURE_LABELS[rule.measures];
  return `${measure ? `${base} ${measure}` : base}*`;
}