export async function createOrGetPrescription(consultationId) {
  const response = await fetch(`/api/consultations/${consultationId}/prescription`, {
    method: "POST"
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create/get prescription");
  return data.prescription;
}

export async function getPrescriptionByConsultation(consultationId) {
  const response = await fetch(`/api/consultations/${consultationId}/prescription`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch prescription");
  return data.prescription;
}

export async function getPrescriptions(query = "") {
  const response = await fetch(`/api/prescriptions${query ? `?${query}` : ""}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch prescriptions");
  return data.prescriptions;
}

export async function getPrescriptionById(prescriptionId) {
  const response = await fetch(`/api/prescriptions/${prescriptionId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch prescription");
  return data.prescription;
}

export async function updatePrescription(prescriptionId, payload) {
  const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update prescription");
  return data.prescription;
}

export async function finalizePrescription(prescriptionId, payload) {
  const response = await fetch(`/api/prescriptions/${prescriptionId}/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to finalize prescription");
  return data.prescription;
}

export async function getPatientPrescriptions(patientId, query = "") {
  const response = await fetch(`/api/patients/${patientId}/prescriptions${query ? `?${query}` : ""}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch patient prescriptions");
  return data.prescriptions;
}

export async function getMyPrescriptions(query = "") {
  const response = await fetch(`/api/doctors/me/prescriptions${query ? `?${query}` : ""}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch doctor prescriptions");
  return data.prescriptions;
}
