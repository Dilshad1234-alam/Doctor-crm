export async function registerUser(payload) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
}

export async function loginUser(payload) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
}

export async function logoutUser() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }
  return data;
}

export async function getCurrentUser() {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      "Cache-Control": "no-cache",
    },
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user");
  }
  return data.user;
}

export async function setupClinic(payload) {
  const response = await fetch("/api/clinics/setup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Clinic setup failed");
  }
  return data;
}
