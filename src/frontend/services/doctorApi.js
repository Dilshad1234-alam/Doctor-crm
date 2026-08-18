export async function createDoctor(payload) {
  const response = await fetch("/api/doctors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create doctor");
  return data;
}

export async function getDoctors(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/doctors?${query}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch doctors");
  return data;
}

export async function getDoctorById(doctorId) {
  if (!doctorId || doctorId.includes('{{')) {
    throw new Error("Invalid doctor ID");
  }
  const response = await fetch(`/api/doctors/${doctorId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch doctor");
  return data.doctor;
}

export async function updateDoctor(doctorId, payload) {
  if (!doctorId || doctorId.includes('{{')) {
    throw new Error("Invalid doctor ID");
  }
  const response = await fetch(`/api/doctors/${doctorId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update doctor");
  return data.doctor;
}

export async function updateDoctorStatus(doctorId, isActive) {
  if (!doctorId || doctorId.includes('{{')) {
    throw new Error("Invalid doctor ID");
  }
  const response = await fetch(`/api/doctors/${doctorId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update doctor status");
  return data;
}

export async function updateDoctorAvailability(doctorId, availability) {
  if (!doctorId || doctorId.includes('{{')) {
    throw new Error("Invalid doctor ID");
  }
  const response = await fetch(`/api/doctors/${doctorId}/availability`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ availability }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update availability");
  return data;
}

export async function getDoctorSummary(doctorId) {
  if (!doctorId || doctorId.includes('{{')) {
    throw new Error("Invalid doctor ID");
  }
  const response = await fetch(`/api/doctors/${doctorId}/summary`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch summary");
  return data;
}

export async function getMyDoctorProfile() {
  const response = await fetch("/api/doctors/me");
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch profile");
  return data.doctor;
}

export async function updateMyAvailability(availability) {
  const response = await fetch("/api/doctors/me/availability", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ availability }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update availability");
  return data;
}

export async function createScheduleException(doctorId, payload, isSelf = false) {
  const url = isSelf ? "/api/doctors/me/schedule-exceptions" : `/api/doctors/${doctorId}/schedule-exceptions`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create exception");
  return data;
}

export async function getScheduleExceptions(doctorId, params = {}, isSelf = false) {
  const query = new URLSearchParams(params).toString();
  const url = isSelf ? `/api/doctors/me/schedule-exceptions?${query}` : `/api/doctors/${doctorId}/schedule-exceptions?${query}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch exceptions");
  return data.exceptions;
}
