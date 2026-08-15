import mongoose from "mongoose";

const clinicProfileSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      unique: true,
    },
    address: {
      line1: { type: String, trim: true, default: "" },
      line2: { type: String, trim: true, default: "" },
      area: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      pincode: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "India" },
    },
    logo: {
      type: String,
      default: null,
    },
    logoUrl: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    coverImageUrl: {
      type: String,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    about: {
      type: String,
      trim: true,
      default: "",
    },
    specialties: {
      type: [String],
      default: [],
    },
    facilities: {
      type: [String],
      default: [],
    },
    consultationDuration: {
      type: Number,
      default: 15,
    },
    openingTime: {
      type: String,
      default: "",
    },
    closingTime: {
      type: String,
      default: "",
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ClinicProfile || mongoose.model("ClinicProfile", clinicProfileSchema);
