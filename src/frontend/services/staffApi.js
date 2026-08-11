import { getAuthToken } from "./apiClient";

const API_BASE = "/api/staff";

export const staffApi = {
  getStaffList: async (params = {}) => {
    const token = getAuthToken();
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}${query ? `?${query}` : ""}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to fetch staff");
    return data;
  },

  getStaffDetails: async (staffId) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/${staffId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to fetch staff details");
    return data;
  },

  createStaff: async (staffData) => {
    const token = getAuthToken();
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(staffData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to create staff");
    return data;
  },

  updateStaff: async (staffId, staffData) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/${staffId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(staffData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to update staff");
    return data;
  },

  updatePermissions: async (staffId, permissions) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/${staffId}/permissions`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ permissions }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to update permissions");
    return data;
  },

  activateStaff: async (staffId) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/${staffId}/activate`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to activate staff");
    return data;
  },

  deactivateStaff: async (staffId) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/${staffId}/deactivate`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to deactivate staff");
    return data;
  }
};
