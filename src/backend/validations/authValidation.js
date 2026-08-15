import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  accountType: z.enum(["clinic", "doctor", "patient"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  accountType: z.enum(["admin", "clinic", "doctor", "patient"]).optional(),
});

export const clinicSetupSchema = z.object({
  name: z.string().min(2, "Clinic name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number is invalid").optional().or(z.literal("")),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional().or(z.literal("")),
  area: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(5, "Pincode is required"),
  consultationDuration: z.coerce.number().min(5, "Minimum 5 minutes").default(15),
  openingTime: z.string().optional().or(z.literal("")),
  closingTime: z.string().optional().or(z.literal("")),
  specialties: z.array(z.string()).optional().default([]),
  facilities: z.array(z.string()).optional().default([]),
  isPublic: z.boolean().optional().default(false),
  logo: z.string().optional().or(z.literal("")),
  coverImage: z.string().optional().or(z.literal("")),
});

