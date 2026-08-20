import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    patientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    patientAge: {
      type: Number,
      required: true,
      min: 0,
    },
    patientGender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "Appointment time must be in HH:mm format",
      },
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 5,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW", "RESCHEDULED"],
      default: "PENDING",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
appointmentSchema.index({ clinicId: 1, bookingId: 1 }, { unique: true });
appointmentSchema.index({ clinicId: 1, doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientPhone: 1 });

export default mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
