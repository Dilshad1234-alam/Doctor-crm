import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "ClinicProfile", required: true },
    key: { type: String, required: true },
    sequence: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

counterSchema.index({ clinicId: 1, key: 1 }, { unique: true });

export default mongoose.models.Counter || mongoose.model("Counter", counterSchema);
