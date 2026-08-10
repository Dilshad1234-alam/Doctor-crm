export async function getAvailableSlots(doctorId, date) {
  const query = new URLSearchParams({ doctorId, date }).toString();
  const res = await fetch(`/api/appointments/available-slots?${query}`);
  return res.json();
}

export async function createAppointment(payload) {
  const res = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function getAppointments(params = {}) {
  const query = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""))).toString();
  const url = query ? `/api/appointments?${query}` : "/api/appointments";
  const res = await fetch(url);
  return res.json();
}

export async function getAppointmentById(id) {
  const res = await fetch(`/api/appointments/${id}`);
  return res.json();
}

export async function rescheduleAppointment(id, payload) {
  const res = await fetch(`/api/appointments/${id}/reschedule`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function cancelAppointment(id, payload) {
  const res = await fetch(`/api/appointments/${id}/cancel`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function markAppointmentNoShow(id) {
  const res = await fetch(`/api/appointments/${id}/no-show`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" }
  });
  return res.json();
}

export async function getPatientAppointments(patientId, params = {}) {
  const query = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""))).toString();
  const url = query ? `/api/patients/${patientId}/appointments?${query}` : `/api/patients/${patientId}/appointments`;
  const res = await fetch(url);
  return res.json();
}

export async function getDoctorAppointments(doctorId, params = {}) {
  const query = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""))).toString();
  const url = query ? `/api/doctors/${doctorId}/appointments?${query}` : `/api/doctors/${doctorId}/appointments`;
  const res = await fetch(url);
  return res.json();
}
