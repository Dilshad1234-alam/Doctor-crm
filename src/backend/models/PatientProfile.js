import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"],
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed", "other"],
    },
    occupation: {
      type: String,
    },
    // Contact / Address
    address: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      country: { type: String },
    },
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String },
    },
    // Health Info
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    currentMedicines: [{ type: String }],
    pastMedicalHistory: [{ type: String }],
    familyMedicalHistory: [{ type: String }],
    habits: {
      smoking: { type: String, enum: ["never", "former", "occasional", "regular", "unknown"] },
      alcohol: { type: String, enum: ["never", "former", "occasional", "regular", "unknown"] },
      tobacco: { type: String, enum: ["never", "former", "occasional", "regular", "unknown"] },
    },
    insurance: {
      provider: { type: String },
      policyNumber: { type: String },
    },
    notes: { type: String },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: false, // Legacy field, keeping for compatibility but making optional
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PatientProfile || mongoose.model("PatientProfile", patientProfileSchema);
