export const reportsApi = {
  async fetchWithAuth(url) {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "An error occurred while fetching reports.");
    }

    const data = await res.json();
    return data.data; // Since our routes return { success: true, data: {...} }
  },

  buildQuery(params) {
    const query = new URLSearchParams();
    if (params.dateFrom) query.append("dateFrom", params.dateFrom);
    if (params.dateTo) query.append("dateTo", params.dateTo);
    if (params.doctorId) query.append("doctorId", params.doctorId);
    return query.toString();
  },

  async getReportSummary(params = {}) {
    return this.fetchWithAuth(`/api/reports/summary?${this.buildQuery(params)}`);
  },

  async getAppointmentReport(params = {}) {
    return this.fetchWithAuth(`/api/reports/appointments?${this.buildQuery(params)}`);
  },

  async getRevenueReport(params = {}) {
    return this.fetchWithAuth(`/api/reports/revenue?${this.buildQuery(params)}`);
  },

  async getDoctorReport(params = {}) {
    return this.fetchWithAuth(`/api/reports/doctors?${this.buildQuery(params)}`);
  },

  async getPatientReport(params = {}) {
    return this.fetchWithAuth(`/api/reports/patients?${this.buildQuery(params)}`);
  },
};
