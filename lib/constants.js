// The five states in scope for Sprint 2.
export const STATES = [
  { code: "AZ", name: "Arizona" },
  { code: "CA", name: "California" },
  { code: "ME", name: "Maine" },
  { code: "MN", name: "Minnesota" },
  { code: "TX", name: "Texas" },
];

// Status options from the data model. Draft is the default.
export const STATUSES = [
  "Draft",
  "Sent",
  "Acknowledged",
  "Fulfilled",
  "Denied",
  "Appealed",
];

export const DEFAULT_STATUS = "Draft";

export const REQUEST_TYPES = [
  { value: "A", label: "A, hotline intake" },
  { value: "B", label: "B, home visiting" },
];

export const SEND_METHODS = [
  { value: "email", label: "Email" },
  { value: "web_portal", label: "Web portal" },
];
