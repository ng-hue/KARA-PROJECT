export const ALLOWED_STATUS_TRANSITIONS = {
  Draft: ["Sent"],
  Sent: ["Acknowledged", "Fulfilled", "Denied"],
  Acknowledged: ["Fulfilled", "Denied"],
  Fulfilled: [],
  Denied: ["Appealed"],
  Appealed: [],
};

export function getAllowedNextStatuses(currentStatus) {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
}

export function canTransitionStatus(fromStatus, toStatus) {
  return getAllowedNextStatuses(fromStatus).includes(toStatus);
}