import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    appointmentCode: {
      type: String,
      required: true,
      trim: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
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
    durationMinutes: {
      type: Number,
      required: true,
      min: 5,
    },
    visitType: {
      type: String,
      enum: ["new_consultation", "follow_up", "regular_checkup", "emergency", "online_consultation"],
      required: true,
    },
    source: {
      type: String,
      enum: ["reception", "doctor", "clinic_owner", "patient_portal", "walk_in"],
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    consultationFee: {
      type: Number,
      min: 0,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "checked_in", "waiting", "in_consultation", "completed", "cancelled", "no_show"],
      default: "scheduled",
      required: true,
    },
    cancellation: {
      reason: { type: String, trim: true },
      cancelledByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      cancelledAt: { type: Date },
    },
    rescheduleHistory: [
      {
        previousDate: { type: Date, required: true },
        previousStartTime: { type: String, required: true },
        previousEndTime: { type: String, required: true },
        changedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        changedAt: { type: Date, default: Date.now },
      },
    ],
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
appointmentSchema.index({ clinicId: 1, appointmentCode: 1 }, { unique: true });
appointmentSchema.index({ clinicId: 1, doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ clinicId: 1, patientId: 1, appointmentDate: -1 });

export default mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
