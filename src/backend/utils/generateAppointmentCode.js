import Counter from "../models/Counter.js";

/**
 * Safely generates a unique appointment code per clinic in the format APT-XXXXXX.
 * @param {string|ObjectId} clinicId 
 * @returns {Promise<string>} e.g., "APT-000001"
 */
export async function generateAppointmentCode(clinicId) {
  if (!clinicId) throw new Error("clinicId is required to generate appointment code");

  const counter = await Counter.findOneAndUpdate(
    { clinicId, key: "appointment" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  return `APT-${String(counter.sequence).padStart(6, "0")}`;
}
