import { z } from "zod";

const chiefComplaintSchema = z.object({
  complaint: z.string().min(1, "Complaint is required"),
  duration: z.string().optional(),
  notes: z.string().optional()
});

const symptomSchema = z.object({
  name: z.string().min(1, "Symptom name is required"),
  duration: z.string().optional(),
  severity: z.enum(["mild", "moderate", "severe", "not_specified"]).optional(),
  notes: z.string().optional()
});

const clinicalExaminationSchema = z.object({
  general: z.string().optional(),
  cardiovascular: z.string().optional(),
  respiratory: z.string().optional(),
  abdomen: z.string().optional(),
  neurological: z.string().optional(),
  other: z.string().optional()
});

const diagnosisSchema = z.object({
  name: z.string().min(1, "Diagnosis name is required"),
  type: z.enum(["primary", "secondary", "provisional", "differential"]).optional(),
  notes: z.string().optional()
});

const recommendedTestSchema = z.object({
  name: z.string().min(1, "Test name is required"),
  category: z.enum(["laboratory", "imaging", "cardiology", "pathology", "other"]).optional(),
  instructions: z.string().optional()
});

const followUpSchema = z.object({
  required: z.boolean().optional(),
  date: z.string().datetime().optional().nullable(),
  reason: z.string().optional(),
  notes: z.string().optional()
});

export const updateConsultationSchema = z.object({
  chiefComplaints: z.array(chiefComplaintSchema).optional(),
  symptoms: z.array(symptomSchema).optional(),
  clinicalExamination: clinicalExaminationSchema.optional(),
  diagnoses: z.array(diagnosisSchema).optional(),
  assessment: z.string().optional(),
  advice: z.string().optional(),
  recommendedTests: z.array(recommendedTestSchema).optional(),
  followUp: followUpSchema.optional(),
  privateDoctorNotes: z.string().optional()
});

export const completeConsultationSchema = updateConsultationSchema.extend({
  // Can add strict checks later if needed
});

export const consultationListQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().optional(),
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  status: z.enum(["in_progress", "completed", "cancelled", "all"]).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

