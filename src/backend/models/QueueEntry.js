import mongoose from "mongoose";

const queueEntrySchema = new mongoose.Schema(
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
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    queueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["checked_in", "waiting", "called", "in_consultation", "skipped", "removed", "completed"],
      default: "waiting",
      required: true,
    },
    checkedInAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    waitingSince: {
      type: Date,
      default: Date.now,
    },
    calledAt: {
      type: Date,
    },
    consultationStartedAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["normal", "urgent", "emergency"],
      default: "normal",
      required: true,
    },
    notes: {
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

// Unique index to prevent duplicate tokens for a doctor on a specific day
queueEntrySchema.index(
  {
    clinicId: 1,
    doctorId: 1,
    queueDate: 1,
    tokenNumber: 1,
  },
  {
    unique: true,
  }
);

// Index for efficiently querying a doctor's active queue on a specific day
queueEntrySchema.index({
  clinicId: 1,
  doctorId: 1,
  queueDate: 1,
  status: 1,
});

// Index to quickly find by appointment ID to prevent duplicate check-ins
queueEntrySchema.index({
  clinicId: 1,
  appointmentId: 1,
});

export default mongoose.models.QueueEntry || mongoose.model("QueueEntry", queueEntrySchema);
