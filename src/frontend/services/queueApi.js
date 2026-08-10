export async function checkInAppointment(appointmentId, payload) {
  const response = await fetch(`/api/appointments/${appointmentId}/check-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to check in");
  return data;
}

export async function getQueue(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/queue?${query}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch queue");
  return data.queue;
}

export async function getMyQueue(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/doctors/me/queue?${query}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch queue");
  return data.queue;
}

export async function callNextPatient() {
  const response = await fetch("/api/queue/call-next", {
    method: "POST",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to call next patient");
  return data;
}

export async function callQueuePatient(queueId) {
  const response = await fetch(`/api/queue/${queueId}/call`, {
    method: "PATCH",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to call patient");
  return data;
}

export async function startQueueConsultation(queueId) {
  const response = await fetch(`/api/queue/${queueId}/start-consultation`, {
    method: "PATCH",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to start consultation");
  return data;
}

export async function skipQueuePatient(queueId, reason = "") {
  const response = await fetch(`/api/queue/${queueId}/skip`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to skip patient");
  return data;
}

export async function getQueueEntryByAppointment(appointmentId) {
  const response = await fetch(`/api/appointments/${appointmentId}/queue`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch queue entry");
  return data.queueEntry;
}

export async function removeQueuePatient(queueId, reason = "") {
  const response = await fetch(`/api/queue/${queueId}/remove`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to remove patient");
  return data;
}
