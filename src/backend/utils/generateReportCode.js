import Counter from "../models/Counter.js";

export async function generateReportCode(clinicId, session = null) {
  const counter = await Counter.findOneAndUpdate(
    { clinicId, key: "medical_report" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, session }
  );

  const sequence = counter.sequence;
  return `RPT-${String(sequence).padStart(6, "0")}`;
}
