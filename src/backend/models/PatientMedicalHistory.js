import mongoose from "mongoose";

const patientMedicalHistorySchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    metadata: { type: Object, default: {} }
  },
  {
    timestamps: true
  }
);

patientMedicalHistorySchema.index({ patientId: 1, clinicId: 1, date: -1 });

export default mongoose.models.PatientMedicalHistory || mongoose.model("PatientMedicalHistory", patientMedicalHistorySchema);
