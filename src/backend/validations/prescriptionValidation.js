import { z } from "zod";

const medicineSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required"),
  strength: z.string().optional(),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.enum([
    "once_daily",
    "twice_daily",
    "three_times_daily",
    "four_times_daily",
    "morning_only",
    "night_only",
    "as_needed",
    "weekly",
    "custom"
  ]),
  customFrequency: z.string().optional(),
  durationValue: z.number().positive("Duration value must be positive"),
  durationUnit: z.enum(["day", "days", "week", "weeks", "month", "months", "dose", "doses"]),
  foodTiming: z.enum(["before_food", "after_food", "with_food", "empty_stomach", "not_specified"]),
  route: z.enum(["oral", "topical", "inhalation", "nasal", "eye", "ear", "injection", "other"]).optional().default("oral"),
  instructions: z.string().max(500).optional()
}).refine(data => {
  if (data.frequency === "custom" && (!data.customFrequency || data.customFrequency.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Custom frequency is required when frequency is set to 'custom'",
  path: ["customFrequency"]
});

const recommendedTestSchema = z.object({
  name: z.string().min(1, "Test name is required"),
  category: z.string().optional(),
  instructions: z.string().optional()
});

const followUpSchema = z.object({
  required: z.boolean().optional(),
  date: z.string().datetime().optional().nullable(),
  reason: z.string().optional()
});

export const updatePrescriptionSchema = z.object({
  medicines: z.array(medicineSchema).optional(),
  generalInstructions: z.string().optional(),
  recommendedTests: z.array(recommendedTestSchema).optional(),
  followUp: followUpSchema.optional()
});

export const finalizePrescriptionSchema = updatePrescriptionSchema.extend({});

export const prescriptionListQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().optional(),
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  status: z.enum(["draft", "finalized", "cancelled", "all"]).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
