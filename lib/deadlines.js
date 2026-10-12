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
//   3. Some states do not have a statutory response deadline, or the deadline is not a fixed number of days.
export const STATE_DEADLINE_RULES = {
  AZ: {
    statuteName: "Arizona Public Records Law (A.R.S. Title 39, Chapter 1, Article 2)",
    days: null,
    dayType: "calendar",  // statute says "promptly", no fixed window, set to calendar/null to indicate no fixed deadline
    citation: "A.R.S. § 39-121.01(D)(1), (E)",
    sourceUrl: "https://www.azleg.gov/ars/39/00121-01.htm", // verify link opens
  },
  CA: {
    statuteName: "California Public Records Act (Gov. Code §§ 7920.000-7931.000)",
    days: 10,          // DETERMINATION of disclosability, not production; extendable 14 days
    dayType: "calendar",
    citation: "Cal. Gov. Code § 7922.535(a)",
    sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=7922.535", // verify link opens
  },
  ME: {
    statuteName: "Maine Freedom of Access Act (1 M.R.S. §§ 400-414)",
    days: 5,           // ACKNOWLEDGMENT and denial notice, not production
    dayType: "business",
    citation: "1 M.R.S. § 408-A(3), (4)",
    sourceUrl: "https://legislature.maine.gov/statutes/1/title1sec408-A.html", // verify link opens
  },
  MN: {
    statuteName: "Minnesota Government Data Practices Act (Minn. Stat. ch. 13)",
    days: null,        
    dayType: "calendar", // "appropriate and prompt manner", reasonable time, set to calendar/null to indicate no fixed deadline
    citation: "Minn. Stat. § 13.03, subd. 2",
    sourceUrl: "https://www.revisor.mn.gov/statutes/?id=13.03",
  },
  TX: {
    statuteName: "Texas Public Information Act (Tex. Gov't Code ch. 552)",
    days: 10,          // produce, or certify in writing and set a date
    dayType: "business",
    citation: "Tex. Gov't Code § 552.221(a), (d)",
    sourceUrl: "https://statutes.capitol.texas.gov/Docs/GV/htm/GV.552.htm#552.221",
  },
};

// Takes a state code and a date string (YYYY-MM-DD).
// Returns the deadline as YYYY-MM-DD, or null if the state has no
// verified rule yet.
export function calculateDeadline(state, dateSent) {
  const rule = STATE_DEADLINE_RULES[state];
  if (!rule || !rule.days || !rule.dayType) return null; // AZ, MN: no fixed deadline
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateSent ?? "")) return null;

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

export function deadlineLabel(state) {
  const rule = STATE_DEADLINE_RULES[state];
  if (!rule) return "State Not Supported";
  if (!rule.days) return "No Fixed Deadline (Promptly)";
  return `${rule.days} ${rule.dayType === "business" ? "Business" : "Calendar"} Days`;
}


// We will need a new way of tracking this. Many states do not have a fixed deadline. Many states
// use language like "promptly" or "reasonable time," which makes it difficult to calculate a specific deadline.