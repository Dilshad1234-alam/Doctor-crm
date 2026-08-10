import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createReportSchema = z.object({
  title: z.string().min(1, "Report title is required").max(150),
  reportType: z.enum([
    "blood_test", 
    "xray", 
    "mri", 
    "ct_scan", 
    "ultrasound", 
    "ecg", 
    "pathology", 
    "prescription", 
    "other"
  ]),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Valid report date is required"),
  notes: z.string().max(500).optional(),
  recommendedTestId: z.string().regex(objectIdRegex, "Invalid test ID").optional().nullable()
});

export const updateReportSchema = z.object({
  title: z.string().max(150).optional(),
  reportType: z.enum([
    "blood_test", 
    "xray", 
    "mri", 
    "ct_scan", 
    "ultrasound", 
    "ecg", 
    "pathology", 
    "prescription", 
    "other"
  ]).optional(),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  notes: z.string().max(500).optional()
});

export const reviewReportSchema = z.object({
  doctorReviewNotes: z.string().min(1, "Review notes are required").max(1000)
});

export const reportListQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().optional(),
  reportType: z.string().optional(),
  reviewStatus: z.enum(["pending_review", "reviewed", "all"]).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});
