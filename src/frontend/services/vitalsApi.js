export async function recordVitals(appointmentId, payload) {
  const response = await fetch(`/api/appointments/${appointmentId}/vitals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to record vitals");
  return data;
}

export async function getAppointmentVitals(appointmentId) {
  const response = await fetch(`/api/appointments/${appointmentId}/vitals`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch vitals");
  return data.vitals; // Could be null if not recorded yet
}

export async function updateVitals(appointmentId, payload) {
  const response = await fetch(`/api/appointments/${appointmentId}/vitals`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update vitals");
  return data;
}

export async function getPatientVitals(patientId, params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/patients/${patientId}/vitals?${query}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch patient vitals history");
  return data;
}
