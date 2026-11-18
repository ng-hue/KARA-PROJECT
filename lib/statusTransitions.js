export const ALLOWED_STATUS_TRANSITIONS = {
  Drafted: ["Sent", "Withdrawn"],

  Sent: [
    "Acknowledged",
    "Provided",
    "Partial",
    "Refused",
    "No response by deadline",
    "Withdrawn",
  ],

  Acknowledged: [
    "Provided",
    "Partial",
    "Refused",
    "No response by deadline",
    "Withdrawn",
  ],

  Partial: [
    "Provided",
    "Refused",
    "No response by deadline",
    "Withdrawn",
  ],

  Provided: [],
  Refused: [],
  "No response by deadline": [],
  Withdrawn: [],
};

export function getAllowedNextStatuses(currentStatus) {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
}

export function canTransitionStatus(fromStatus, toStatus) {
  return getAllowedNextStatuses(fromStatus).includes(toStatus);
}