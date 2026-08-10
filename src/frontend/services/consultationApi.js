export async function getConsultations(query = "") {
  const response = await fetch(`/api/consultations${query ? `?${query}` : ""}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch consultations");
  return data.consultations;
}

export async function getConsultationById(consultationId) {
  const response = await fetch(`/api/consultations/${consultationId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch consultation");
  return data.consultation;
}

export async function updateConsultation(consultationId, consultationData) {
  const response = await fetch(`/api/consultations/${consultationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(consultationData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update consultation");
  return data.consultation;
}

export async function completeConsultation(consultationId, consultationData) {
  const response = await fetch(`/api/consultations/${consultationId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(consultationData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to complete consultation");
  return data.consultation;
}
