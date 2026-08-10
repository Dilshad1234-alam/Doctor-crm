import Counter from "../models/Counter.js";

export async function generateConsultationCode(clinicId, session) {
  const counter = await Counter.findOneAndUpdate(
    { clinicId, key: "consultation" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, session }
  );

  const sequence = counter.sequence;
  return `CON-${String(sequence).padStart(6, "0")}`;
}
