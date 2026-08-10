import { z } from "zod";

const numericPositive = (max) => z.number().positive().max(max).optional().nullable();

export const createVitalsSchema = z.object({
  heightCm: z.number().positive("Height must be positive").max(300, "Height seems unusually high").optional().nullable(),
  weightKg: z.number().positive("Weight must be positive").max(500, "Weight seems unusually high").optional().nullable(),
  temperatureC: z.number().positive("Temperature must be positive").max(45, "Temperature seems unusually high").min(30, "Temperature seems unusually low").optional().nullable(),
  
  bloodPressure: z.object({
    systolic: z.number().positive("Systolic must be positive").max(300).optional().nullable(),
    diastolic: z.number().positive("Diastolic must be positive").max(200).optional().nullable(),
  }).optional().nullable(),
  
  pulseRate: z.number().positive("Pulse must be positive").max(300).optional().nullable(),
  oxygenSaturation: z.number().min(0).max(100, "Oxygen Saturation cannot exceed 100%").optional().nullable(),
  respiratoryRate: z.number().positive("Respiratory rate must be positive").max(100).optional().nullable(),
  
  bloodSugar: z.object({
    value: z.number().nonnegative("Blood sugar cannot be negative").max(1000).optional().nullable(),
    type: z.enum(["random", "fasting", "post_meal", "unknown"]).default("unknown"),
  }).optional().nullable(),
  
  notes: z.string().trim().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
});

export const updateVitalsSchema = createVitalsSchema;
