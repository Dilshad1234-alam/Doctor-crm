export async function getSettings() {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error(await res.text() || "Failed to load settings");
  return res.json();
}

export async function updateClinicProfile(data) {
  const res = await fetch("/api/settings/clinic", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text() || "Failed to update clinic profile");
  return res.json();
}

export async function updateWorkingHours(data) {
  const res = await fetch("/api/settings/working-hours", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text() || "Failed to update working hours");
  return res.json();
}

export async function updateAppointmentSettings(data) {
  const res = await fetch("/api/settings/appointments", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text() || "Failed to update appointment settings");
  return res.json();
}

export async function updateBillingSettings(data) {
  const res = await fetch("/api/settings/billing", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text() || "Failed to update billing settings");
  return res.json();
}

export async function updatePrescriptionSettings(data) {
  const res = await fetch("/api/settings/prescriptions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text() || "Failed to update prescription settings");
  return res.json();
}

export async function updateNotificationSettings(data) {
  const res = await fetch("/api/settings/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text() || "Failed to update notification settings");
  return res.json();
}

export async function changePassword(data) {
  const res = await fetch("/api/settings/security", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text() || "Failed to change password");
  return res.json();
}
