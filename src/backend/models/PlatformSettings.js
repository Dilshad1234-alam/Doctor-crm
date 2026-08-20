import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      required: true,
      default: "Clinora",
    },
    supportEmail: {
      type: String,
      default: "support@clinora.com",
    },
    supportPhone: {
      type: String,
      default: "+1-800-CLINORA",
    },
    notifications: {
      emailEnabled: {
        type: Boolean,
        default: true,
      },
      smsEnabled: {
        type: Boolean,
        default: false,
      },
    },
    security: {
      requireStrongPasswords: {
        type: Boolean,
        default: true,
      },
      sessionTimeoutMinutes: {
        type: Number,
        default: 60,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PlatformSettings || mongoose.model("PlatformSettings", platformSettingsSchema);
