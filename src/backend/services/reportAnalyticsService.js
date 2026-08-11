import { reportAnalyticsRepository } from "../repositories/reportAnalyticsRepository";

function enforceFilters(authUser, filters) {
  if (!authUser.clinicId) {
    throw new Error("Unauthorized: No clinic assigned.");
  }
  
  let doctorId = filters.doctorId;
  if (authUser.role === "doctor") {
    doctorId = authUser.doctorId;
  }
  
  return {
    clinicId: authUser.clinicId,
    doctorId,
    startDate: filters.dateFrom,
    endDate: filters.dateTo
  };
}

export const reportAnalyticsService = {
  async getReportSummary(authUser, filters) {
    const { clinicId, doctorId, startDate, endDate } = enforceFilters(authUser, filters);
    const summary = await reportAnalyticsRepository.getSummaryMetrics(clinicId, doctorId, startDate, endDate);
    
    if (authUser.role === "assistant") {
      summary.totalRevenue = 0;
      summary.pendingPayments = 0;
    }
    
    return summary;
  },

  async getAppointmentReport(authUser, filters) {
    const { clinicId, doctorId, startDate, endDate } = enforceFilters(authUser, filters);
    return await reportAnalyticsRepository.getAppointmentReport(clinicId, doctorId, startDate, endDate);
  },

  async getRevenueReport(authUser, filters) {
    if (["assistant", "receptionist"].includes(authUser.role)) {
      throw new Error("Unauthorized: Insufficient permissions to view revenue.");
    }
    const { clinicId, doctorId, startDate, endDate } = enforceFilters(authUser, filters);
    return await reportAnalyticsRepository.getRevenueReport(clinicId, doctorId, startDate, endDate);
  },

  async getDoctorPerformanceReport(authUser, filters) {
    if (authUser.role === "doctor") {
      throw new Error("Unauthorized: Doctors cannot view clinic-wide doctor performance report.");
    }
    if (["assistant", "receptionist"].includes(authUser.role)) {
      throw new Error("Unauthorized: Insufficient permissions.");
    }
    const { clinicId, startDate, endDate } = enforceFilters(authUser, filters);
    return await reportAnalyticsRepository.getDoctorPerformanceReport(clinicId, startDate, endDate);
  },

  async getPatientReport(authUser, filters) {
    const { clinicId, doctorId, startDate, endDate } = enforceFilters(authUser, filters);
    return await reportAnalyticsRepository.getPatientReport(clinicId, doctorId, startDate, endDate);
  }
};
