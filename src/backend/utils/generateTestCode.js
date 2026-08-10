import Counter from "../models/Counter.js";

export async function generateTestCode(clinicId, session = null) {
  const counter = await Counter.findOneAndUpdate(
    { clinicId, key: "recommended_test" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, session }
  );

  const sequence = counter.sequence;
  return `TEST-${String(sequence).padStart(6, "0")}`;
}
