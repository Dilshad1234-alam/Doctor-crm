import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    patientCode: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    fullName: { type: String },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    email: { type: String },
    dateOfBirth: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] },
    bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"] },
    maritalStatus: { type: String, enum: ["single", "married", "divorced", "widowed", "other"] },
    occupation: { type: String },
    address: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      country: { type: String }
    },
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String }
    },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    currentMedicines: [{ type: String }],
    pastMedicalHistory: [{ type: String }],
    familyMedicalHistory: [{ type: String }],
    habits: {
      smoking: { type: String, enum: ["never", "former", "occasional", "regular", "unknown"] },
      alcohol: { type: String, enum: ["never", "former", "occasional", "regular", "unknown"] },
      tobacco: { type: String, enum: ["never", "former", "occasional", "regular", "unknown"] }
    },
    insurance: {
      provider: { type: String },
      policyNumber: { type: String }
    },
    notes: { type: String },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastUpdatedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

patientSchema.index({ clinicId: 1, patientCode: 1 }, { unique: true });
patientSchema.index({ clinicId: 1, phone: 1 });
patientSchema.index({ clinicId: 1, fullName: 1 });

export default mongoose.models.Patient || mongoose.model("Patient", patientSchema);
