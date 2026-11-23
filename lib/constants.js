// The eight states in scope for the project. AK, FL and HI are the Sprint 5
// pilot states (S5 US7).
export const STATES = [
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "CA", name: "California" },
  { code: "FL", name: "Florida" },
  { code: "HI", name: "Hawaii" },
  { code: "ME", name: "Maine" },
  { code: "MN", name: "Minnesota" },
  { code: "TX", name: "Texas" },
];

// Sprint 5 Master Fields List status set.
// Drafted is the default status for a new request.
export const STATUSES = [
  "Drafted",
  "Sent",
  "Acknowledged",
  "Provided",
  "Partial",
  "Refused",
  "No response by deadline",
  "Withdrawn",
];

export const DEFAULT_STATUS = "Drafted";

export const REQUEST_TYPES = [
  { value: "A", label: "A, hotline intake" },
  { value: "B", label: "B, home visiting" },
];

export const SEND_METHODS = [
  { value: "email", label: "Email" },
  { value: "web_portal", label: "Web portal" },
];
