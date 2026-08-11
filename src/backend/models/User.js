import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Hidden by default
    },
    role: {
      type: String,
      enum: ["unassigned", "clinic_owner", "doctor", "receptionist", "assistant", "accountant", "super_admin", "patient"],
      default: "unassigned",
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      default: null,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      default: null,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffProfile",
      default: null,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientProfile",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
