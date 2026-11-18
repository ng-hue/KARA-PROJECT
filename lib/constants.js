// The five states in scope for the project.
export const STATES = [
  { code: "AZ", name: "Arizona" },
  { code: "CA", name: "California" },
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