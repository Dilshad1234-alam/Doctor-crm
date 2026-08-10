import { z } from "zod";

const addressSchema = z.object({
  line1: z.string().trim().optional(),
  line2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  country: z.string().trim().optional(),
}).optional();

const emergencyContactSchema = z.object({
  name: z.string().trim().optional(),
  relation: z.string().trim().optional(),
  phone: z.string().trim().optional(),
}).optional();

const habitsSchema = z.object({
  smoking: z.enum(["never", "former", "occasional", "regular", "unknown"]).optional(),
  alcohol: z.enum(["never", "former", "occasional", "regular", "unknown"]).optional(),
  tobacco: z.enum(["never", "former", "occasional", "regular", "unknown"]).optional(),
}).optional();

const insuranceSchema = z.object({
  provider: z.string().trim().optional(),
  policyNumber: z.string().trim().optional(),
}).optional();

const basePatientSchema = {
  firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().optional().or(z.literal('')),
  phone: z.string().trim().min(5, "Valid phone number required"), // relaxed for diverse testing
  alternatePhone: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email("Invalid email").optional().or(z.literal('')),
  
  dateOfBirth: z.string().or(z.date()).refine(val => {
    if (!val) return true;
    const dob = new Date(val);
    return !isNaN(dob.getTime()) && dob <= new Date();
  }, { message: "Date of birth cannot be in the future" }).optional().or(z.literal('')),
  age: z.number().or(z.string().transform(v => v === "" ? undefined : Number(v))).refine(v => v === undefined || (!isNaN(v) && v >= 0 && v <= 130), {message: "Age must be between 0 and 130"}).optional(),
  
  gender: z.enum(["male", "female", "other", "prefer_not_to_say", ""]).optional().transform(v => v === "" ? undefined : v),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown", ""]).optional().transform(v => v === "" ? undefined : v),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed", "other", ""]).optional().transform(v => v === "" ? undefined : v),
  occupation: z.string().trim().optional().or(z.literal('')),

  address: addressSchema,
  emergencyContact: emergencyContactSchema,
  
  allergies: z.array(z.string().trim().min(1)).optional(),
  chronicConditions: z.array(z.string().trim().min(1)).optional(),
  currentMedicines: z.array(z.string().trim().min(1)).optional(),
  pastMedicalHistory: z.array(z.string().trim().min(1)).optional(),
  familyMedicalHistory: z.array(z.string().trim().min(1)).optional(),
  
  habits: habitsSchema,
  insurance: insuranceSchema,
  
  notes: z.string().trim().max(2000, "Notes cannot exceed 2000 characters").optional().or(z.literal(''))
};

// Use strict so unknown fields (like clinicId or patientCode) from client are rejected
export const createPatientSchema = z.object(basePatientSchema).strict();
export const updatePatientSchema = z.object(basePatientSchema).partial().strict();

export const patientListQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  search: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  bloodGroup: z.string().trim().optional(),
  status: z.enum(["active", "inactive", "all"]).optional().default("active"),
  sortBy: z.enum(["createdAt", "updatedAt", "fullName", "age", "patientCode"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc")
});
