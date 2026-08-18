import { z } from "zod";

const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const createAppointmentSchema = z.object({
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid patient ID"),
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid doctor ID"),
  appointmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  startTime: z.string().regex(TIME_REGEX, "Start time must be HH:mm"),
  visitType: z.enum(["new_consultation", "follow_up", "regular_checkup", "emergency", "online_consultation"]).default("new_consultation"),
  reason: z.string().optional(),
  notes: z.string().optional(),
  clinicId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid clinic ID").optional(),
});

export const rescheduleAppointmentSchema = z.object({
  appointmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  startTime: z.string().regex(TIME_REGEX, "Start time must be HH:mm"),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().min(3, "Cancellation reason is required").max(500),
});

export const availableSlotsQuerySchema = z.object({
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid doctor ID"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  clinicId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid clinic ID").optional(),
});

export const appointmentListQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).optional().transform(Number).default("10"),
  search: z.string().optional(),
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  date: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.string().optional(),
  visitType: z.string().optional(),
});
