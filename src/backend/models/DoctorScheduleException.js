import mongoose from "mongoose";

const exceptionSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "Start time must be in HH:mm format",
      },
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "End time must be in HH:mm format",
      },
    },
  },
  { _id: false }
);

const doctorScheduleExceptionSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClinicProfile",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["leave", "holiday", "custom_hours", "emergency_unavailable"],
      required: true,
    },
    isAvailable: {
      type: Boolean,
      required: true,
    },
    customSlots: {
      type: [exceptionSlotSchema],
      default: [],
    },
    reason: {
      type: String,
      trim: true,
    },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add unique index for a specific doctor and date combination
doctorScheduleExceptionSchema.index({ doctorId: 1, date: 1 }, { unique: true });
doctorScheduleExceptionSchema.index({ clinicId: 1, date: 1 });

export default mongoose.models.DoctorScheduleException || mongoose.model("DoctorScheduleException", doctorScheduleExceptionSchema);
