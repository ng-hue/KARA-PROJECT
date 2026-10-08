import { calculateDeadline } from "./deadlines";

// Fake data only. No real names, agencies, or correspondence.
const rows = [
  { title: "Placement policy manual", request_text: "All current written policies on emergency placements, 2024 to present.", state: "AZ", target_agency: "Office of Sample Records, Fictional County", date_sent: "2026-09-02", status: "Sent" },
  { title: "Caseworker caseload reports", request_text: "Monthly caseload summary reports for fiscal year 2025.", state: "CA", target_agency: "Example Department of Family Services", date_sent: "2026-09-05", status: "Acknowledged" },
  { title: "Training curriculum", request_text: "The current new-hire training curriculum for intake staff.", state: "ME", target_agency: "Placeholder Bureau of Child Services", date_sent: "2026-08-21", status: "Fulfilled" },
  { title: "Contract list", request_text: "A list of all active contracts with private placement providers.", state: "MN", target_agency: "Demo County Human Services", date_sent: "2026-09-12", status: "Sent" },
  { title: "Audit findings", request_text: "Any internal audit reports completed in 2025.", state: "TX", target_agency: "Sample State Records Office", date_sent: "2026-08-14", status: "Denied" },
  { title: "Budget breakdown", request_text: "Line-item budget for foster care services, fiscal year 2026.", state: "AZ", target_agency: "Fictional Department of Budget Review", date_sent: "2026-09-18", status: "Draft" },
  { title: "Complaint log", request_text: "The log of formal complaints received, with identifying details removed.", state: "CA", target_agency: "Example Ombudsman Office", date_sent: "2026-08-30", status: "Appealed" },
  { title: "Meeting minutes", request_text: "Minutes from advisory board meetings held in 2026.", state: "ME", target_agency: "Placeholder Advisory Board", date_sent: "2026-09-22", status: "Sent" },
  { title: "Staffing levels", request_text: "Quarterly staffing level reports for 2025 and 2026.", state: "MN", target_agency: "Demo Workforce Office", date_sent: "2026-09-25", status: "Draft" },
  { title: "Records retention schedule", request_text: "The current records retention schedule for case files.", state: "TX", target_agency: "Sample Archives Division", date_sent: "2026-09-28", status: "Acknowledged" },
];

export const SAMPLE_REQUESTS = rows.map((row, i) => ({
  id: `sample-${i + 1}`,
  ...row,
  deadline: calculateDeadline(row.state, row.date_sent),
  created_at: `${row.date_sent}T12:00:00Z`,
}));
