import { z } from "zod";

const timeSlotSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be HH:mm"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be HH:mm"),
}).refine(data => data.startTime < data.endTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const doctorAvailabilitySchema = z.array(
  z.object({
    day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
    isAvailable: z.boolean().default(true),
    slots: z.array(timeSlotSchema),
  })
).refine(days => {
  const uniqueDays = new Set(days.map(d => d.day));
  return uniqueDays.size === days.length;
}, {
  message: "Duplicate days are not allowed",
});

const baseDoctorSchema = z.object({
  title: z.string().trim().optional(),
  specialization: z.string().min(1, "Specialization is required").trim(),
  subSpecialization: z.string().trim().optional(),
  qualification: z.array(z.string().trim()).min(1, "At least one qualification is required"),
  registrationNumber: z.string().min(1, "Registration number is required").trim(),
  registrationCouncil: z.string().trim().optional(),
  experienceYears: z.coerce.number().min(0, "Experience cannot be negative").default(0),
  consultationFee: z.coerce.number().min(0, "Consultation fee cannot be negative"),
  followUpFee: z.coerce.number().min(0, "Follow-up fee cannot be negative").default(0),
  followUpValidityDays: z.coerce.number().min(0).max(365, "Validity cannot exceed 365 days").default(0),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  dateOfBirth: z.coerce.date().max(new Date(), "Date of birth cannot be in the future").optional().nullable(),
  bio: z.string().trim().optional(),
  languages: z.array(z.string().trim()).default([]),
  consultationTypes: z.object({
    inPerson: z.boolean().default(true),
    online: z.boolean().default(false),
  }).default({ inPerson: true, online: false }),
  availability: doctorAvailabilitySchema.optional().default([]),
  defaultSlotDuration: z.coerce.number().min(5, "Slot duration must be at least 5 minutes").default(15),
  maxAppointmentsPerDay: z.coerce.number().min(0, "Max appointments cannot be negative").default(30),
  isAcceptingAppointments: z.boolean().optional(),
  // New Step 2 Fields
  isAvailable: z.boolean().optional(),
  availableDays: z.array(z.string()).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  breakStart: z.string().optional().nullable(),
  breakEnd: z.string().optional().nullable(),
  slotDuration: z.coerce.number().optional(),
  maxPatientsPerDay: z.coerce.number().optional(),
});

export const createDoctorSchema = baseDoctorSchema.extend({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  phone: z.string().trim().optional().nullable(),
  temporaryPassword: z.string()
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.temporaryPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const updateDoctorSchema = baseDoctorSchema.extend({
  name: z.string().min(1, "Name is required").trim().optional(),
  phone: z.string().trim().optional().nullable(),
  isAcceptingAppointments: z.boolean().optional(),
}).partial();

export const scheduleExceptionSchema = z.object({
  date: z.coerce.date(),
  type: z.enum(["leave", "holiday", "custom_hours", "emergency_unavailable"]),
  isAvailable: z.boolean(),
  customSlots: z.array(timeSlotSchema).default([]),
  reason: z.string().trim().optional(),
}).refine(data => {
  if (data.isAvailable && data.customSlots.length === 0) {
    return false;
  }
  return true;
}, {
  message: "Custom slots are required when marked as available",
  path: ["customSlots"],
});

export const doctorListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "all"]).default("all"),
  specialization: z.string().optional(),
  gender: z.string().optional(),
  consultationType: z.enum(["inPerson", "online", "all"]).default("all"),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
