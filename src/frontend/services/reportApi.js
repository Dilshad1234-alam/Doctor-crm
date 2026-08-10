export async function uploadReport(patientId, formData) {
  // Using native fetch because formData requires boundary headers automatically set by browser
  const response = await fetch(`/api/patients/${patientId}/reports`, {
    method: "POST",
    body: formData,
    // Note: Do NOT set Content-Type header manually when sending FormData,
    // the browser will set it with the correct boundary automatically.
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to upload report");
  return data.report;
}

export async function getPatientReports(patientId, query = "") {
  const response = await fetch(`/api/patients/${patientId}/reports${query ? `?${query}` : ""}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch reports");
  return data.reports;
}

export async function getAllReports(query = "") {
  const response = await fetch(`/api/reports${query ? `?${query}` : ""}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch reports");
  return data.reports;
}

export async function getReport(reportId) {
  const response = await fetch(`/api/reports/${reportId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch report");
  return data.report;
}

export async function updateReport(reportId, payload) {
  const response = await fetch(`/api/reports/${reportId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update report");
  return data.report;
}

export async function reviewReport(reportId, payload) {
  const response = await fetch(`/api/reports/${reportId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to review report");
  return data.report;
}

export async function getPatientTests(patientId, query = "") {
  const response = await fetch(`/api/patients/${patientId}/tests${query ? `?${query}` : ""}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch tests");
  return data.tests;
}

export async function getConsultationTests(consultationId) {
  const response = await fetch(`/api/consultations/${consultationId}/tests`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch consultation tests");
  return data.tests;
}
