import Counter from "../models/Counter.js";

/**
 * Generates a unique patient code like PAT-000001
 * @param {string} clinicId - The ID of the clinic
 * @returns {Promise<string>} The generated patient code
 */
export async function generatePatientCode(clinicId) {
  // Use findOneAndUpdate with upsert to atomic increment
  const counter = await Counter.findOneAndUpdate(
    { clinicId, key: "patient" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  const sequence = counter.sequence;
  // Pad the sequence to 6 digits, e.g., 000001
  const paddedSequence = String(sequence).padStart(6, "0");
  return `PAT-${paddedSequence}`;
}
