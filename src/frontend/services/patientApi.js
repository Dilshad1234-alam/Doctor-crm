export async function createPatient(payload) {
  const res = await fetch("/api/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function getPatients(params = {}) {
  const query = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""))).toString();
  const url = query ? `/api/patients?${query}` : "/api/patients";
  const res = await fetch(url);
  return res.json();
}

export async function getPatientById(patientId) {
  const res = await fetch(`/api/patients/${patientId}`);
  return res.json();
}

export async function updatePatient(patientId, payload) {
  const res = await fetch(`/api/patients/${patientId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function searchPatients(query) {
  const res = await fetch(`/api/patients/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function getPatientHistory(patientId, params = {}) {
  const query = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""))).toString();
  const url = query ? `/api/patients/${patientId}/history?${query}` : `/api/patients/${patientId}/history`;
  const res = await fetch(url);
  return res.json();
}

export async function getPatientSummary(patientId) {
  const res = await fetch(`/api/patients/${patientId}/summary`);
  return res.json();
}
