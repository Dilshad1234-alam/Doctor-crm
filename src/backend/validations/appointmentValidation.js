import { z } from "zod";

const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const createAppointmentSchema = z.object({
  patientName: z.string().min(2, "Patient name must be at least 2 characters"),
  patientPhone: z.string().min(10, "Valid phone number required"),
  patientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  patientAge: z.number().min(0, "Age cannot be negative"),
  patientGender: z.enum(["Male", "Female", "Other"]),
  serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid service ID"),
  appointmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  appointmentTime: z.string().regex(TIME_REGEX, "Appointment time must be HH:mm"),
});

export const rescheduleAppointmentSchema = z.object({
  appointmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  appointmentTime: z.string().regex(TIME_REGEX, "Appointment time must be HH:mm"),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().min(3, "Cancellation reason is required").max(500).optional(),
});

export const appointmentListQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).optional().transform(Number).default("10"),
  search: z.string().optional(),
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.string().optional(),
});

export const availableSlotsQuerySchema = z.object({
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid doctor ID"),
  date: z.string().optional()
});
