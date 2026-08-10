import Counter from "../models/Counter.js";

export async function generatePrescriptionCode(clinicId, session = null) {
  const counter = await Counter.findOneAndUpdate(
    { clinicId, key: "prescription" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, session }
  );

  const sequence = counter.sequence;
  return `RX-${String(sequence).padStart(6, "0")}`;
}
