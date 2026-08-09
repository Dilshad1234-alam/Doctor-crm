import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
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

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    slots: {
      type: [slotSchema],
      default: [],
    },
  },
  { _id: false }
);

const doctorProfileSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    subSpecialization: {
      type: String,
      trim: true,
    },
    qualification: {
      type: [String],
      required: true,
      validate: [v => v.length > 0, "At least one qualification is required"],
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    registrationCouncil: {
      type: String,
      trim: true,
    },
    experienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },
    consultationFee: {
      type: Number,
      min: 0,
      required: true,
    },
    followUpFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    followUpValidityDays: {
      type: Number,
      min: 0,
      max: 365,
      default: 0,
    },
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return v < new Date();
        },
        message: "Date of birth cannot be in the future",
      },
    },
    profileImage: {
      type: String,
    },
    bio: {
      type: String,
      trim: true,
    },
    languages: {
      type: [String],
      default: [],
    },
    consultationTypes: {
      inPerson: {
        type: Boolean,
        default: true,
      },
      online: {
        type: Boolean,
        default: false,
      },
    },
    availability: {
      type: [availabilitySchema],
      default: [],
    },
    defaultSlotDuration: {
      type: Number,
      default: 15,
      min: 5,
    },
    maxAppointmentsPerDay: {
      type: Number,
      default: 30,
      min: 0,
    },
    isAcceptingAppointments: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastUpdatedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
doctorProfileSchema.index({ clinicId: 1, employeeId: 1 }, { unique: true });
doctorProfileSchema.index({ clinicId: 1, specialization: 1 });
doctorProfileSchema.index({ clinicId: 1, isActive: 1 });

export default mongoose.models.DoctorProfile || mongoose.model("DoctorProfile", doctorProfileSchema);
