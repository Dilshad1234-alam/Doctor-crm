import mongoose from "mongoose";

const staffProfileSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    staffCode: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["receptionist", "assistant", "accountant"],
      required: true,
    },
    phone: {
      type: String,
    },
    employeeId: {
      type: String,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    permissions: [
      {
        type: String,
      }
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
    },
    createdByModel: {
      type: String,
      enum: ["Admin", "Clinic"],
    }
  },
  {
    timestamps: true,
  }
);

staffProfileSchema.index({ clinicId: 1, staffCode: 1 }, { unique: true });

export default mongoose.models.StaffProfile || mongoose.model("StaffProfile", staffProfileSchema);
