export const APPOINTMENT_STATUSES = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  WAITING: "waiting",
  IN_CONSULTATION: "in_consultation",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
};

export const ACTIVE_STATUSES = [
  APPOINTMENT_STATUSES.SCHEDULED,
  APPOINTMENT_STATUSES.CONFIRMED,
  APPOINTMENT_STATUSES.CHECKED_IN,
  APPOINTMENT_STATUSES.WAITING,
  APPOINTMENT_STATUSES.IN_CONSULTATION,
];

// Returns true if the slot is occupied (i.e. cannot be double-booked)
export function isStatusOccupyingSlot(status) {
  return ACTIVE_STATUSES.includes(status);
}

// Check if appointment is in a terminal state (cannot be changed)
export function isStatusTerminal(status) {
  return [
    APPOINTMENT_STATUSES.COMPLETED,
    APPOINTMENT_STATUSES.CANCELLED,
    APPOINTMENT_STATUSES.NO_SHOW,
  ].includes(status);
}

// Can the appointment be rescheduled?
export function canReschedule(status) {
  return !isStatusTerminal(status) && status !== APPOINTMENT_STATUSES.IN_CONSULTATION;
}

// Can the appointment be cancelled?
export function canCancel(status) {
  return !isStatusTerminal(status);
}
