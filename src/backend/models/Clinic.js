import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Clinic name is required"],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Clinic || mongoose.model("Clinic", clinicSchema);
