import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const invoiceItemSchema = z.object({
  type: z.enum(["consultation", "procedure", "test", "service", "other"]),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  // amount will be recalculated on the backend, but we can accept it for validation matching
  amount: z.number().min(0).optional(),
});

const discountSchema = z.object({
  type: z.enum(["none", "flat", "percentage"]),
  value: z.number().min(0).optional(),
  reason: z.string().optional(),
});

const taxSchema = z.object({
  enabled: z.boolean(),
  percentage: z.number().min(0).optional(),
});

export const createInvoiceSchema = z.object({
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  discount: discountSchema.optional(),
  tax: taxSchema.optional(),
  notes: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  items: z.array(invoiceItemSchema).min(1, "At least one item is required").optional(),
  discount: discountSchema.optional(),
  tax: taxSchema.optional(),
  notes: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive("Payment amount must be greater than 0"),
  paymentMethod: z.enum(["cash", "upi", "card", "bank_transfer", "online", "other"]),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().optional(), // ISO date string, if backdating is allowed
});

export const invoiceListQuerySchema = z.object({
  status: z.enum(["draft", "unpaid", "partially_paid", "paid", "cancelled", "refunded", "all"]).optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  doctorId: z.string().regex(objectIdRegex, "Invalid Doctor ID").optional(),
  patientId: z.string().regex(objectIdRegex, "Invalid Patient ID").optional(),
}).passthrough();

export const paymentListQuerySchema = z.object({
  status: z.enum(["success", "pending", "failed", "refunded", "all"]).optional(),
  method: z.enum(["cash", "upi", "card", "bank_transfer", "online", "other", "all"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
}).passthrough();
