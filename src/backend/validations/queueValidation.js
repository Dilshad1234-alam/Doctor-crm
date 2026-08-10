import { z } from "zod";

export const checkInSchema = z.object({
  priority: z.enum(["normal", "urgent", "emergency"]).default("normal"),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const queueActionSchema = z.object({
  action: z.enum(["call", "start_consultation", "skip", "remove"]),
  reason: z.string().trim().max(500).optional(), // Optional reason for skip/remove
});

export const queueListQuerySchema = z.object({
  doctorId: z.string().optional(),
  date: z.string().optional(), // YYYY-MM-DD format
  status: z.enum(["waiting", "called", "in_consultation", "checked_in", "skipped", "removed", "active", "all"]).default("active"),
  priority: z.enum(["normal", "urgent", "emergency", "all"]).default("all"),
});
