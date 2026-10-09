// Statutory response deadlines (US4, owner: Daniel Anderson).
//
// TODO: Every value below is intentionally empty. Fill each state in from
// primary-source research only, and get sponsor review before merging.
//   days:    number of days the agency has to respond
//   dayType: "calendar" or "business"
//
// Open questions for the sponsor, still unresolved:
//   1. Does the count start on the date sent, or the day after?
//   2. Do business days skip holidays, or only weekends?
//      (calculateDeadline below currently skips weekends only and starts
//      counting the day after the date sent.)
export const STATE_DEADLINE_RULES = {
  AZ: { statuteName: null, days: null, dayType: null, citation: null, sourceUrl: null },
  CA: { statuteName: null, days: null, dayType: null, citation: null, sourceUrl: null },
  ME: { statuteName: null, days: null, dayType: null, citation: null, sourceUrl: null },
  MN: { statuteName: null, days: null, dayType: null, citation: null, sourceUrl: null },
  TX: { statuteName: null, days: null, dayType: null, citation: null, sourceUrl: null },
};

// Takes a state code and a date string (YYYY-MM-DD).
// Returns the deadline as YYYY-MM-DD, or null if the state has no
// verified rule yet.
export function calculateDeadline(state, dateSent) {
  const rule = STATE_DEADLINE_RULES[state];
  if (!rule || !rule.days || !rule.dayType || !dateSent) return null;

  const [y, m, d] = dateSent.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  if (rule.dayType === "calendar") {
    date.setUTCDate(date.getUTCDate() + rule.days);
  } else {
    let added = 0;
    while (added < rule.days) {
      date.setUTCDate(date.getUTCDate() + 1);
      const day = date.getUTCDay();
      if (day !== 0 && day !== 6) added += 1;
    }
  }

  return date.toISOString().slice(0, 10);
}
