import mongoose from "mongoose";

const patientVitalsSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    heightCm: { type: Number },
    weightKg: { type: Number },
    temperatureC: { type: Number },

    bloodPressure: {
      systolic: { type: Number },
      diastolic: { type: Number },
    },

    pulseRate: { type: Number },
    oxygenSaturation: { type: Number },
    respiratoryRate: { type: Number },

    bloodSugar: {
      value: { type: Number },
      type: { 
        type: String, 
        enum: ["random", "fasting", "post_meal", "unknown"] 
      },
    },

    bmi: { type: Number },

    notes: { type: String, trim: true },

    recordedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One primary vitals record per appointment
patientVitalsSchema.index(
  { clinicId: 1, appointmentId: 1 },
  { unique: true }
);

// Index for efficiently querying a patient's vital history across the clinic
patientVitalsSchema.index({
  clinicId: 1,
  patientId: 1,
  recordedAt: -1,
});

export default mongoose.models.PatientVitals || mongoose.model("PatientVitals", patientVitalsSchema);
