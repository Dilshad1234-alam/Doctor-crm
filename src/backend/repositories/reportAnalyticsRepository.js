import mongoose from "mongoose";
import Appointment from "../models/Appointment";
import Consultation from "../models/Consultation";
import Payment from "../models/Payment";
import PatientProfile from "../models/PatientProfile";
import Invoice from "../models/Invoice";
import DoctorProfile from "../models/DoctorProfile";

/**
 * Helper to build the common match stage for date range and clinic/doctor filters.
 */
function buildMatchStage(clinicId, doctorId, dateField, startDate, endDate) {
  const match = {
    clinicId: new mongoose.Types.ObjectId(clinicId),
  };
  
  if (doctorId) {
    match.doctorId = new mongoose.Types.ObjectId(doctorId);
  }

  if (startDate && endDate) {
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);
    match[dateField] = {
      $gte: new Date(startDate),
      $lte: end,
    };
  }
  
  return match;
}

export const reportAnalyticsRepository = {
  
  async getSummaryMetrics(clinicId, doctorId, startDate, endDate) {
    const apptMatch = buildMatchStage(clinicId, doctorId, "appointmentDate", startDate, endDate);
    const consultMatch = buildMatchStage(clinicId, doctorId, "createdAt", startDate, endDate);
    consultMatch.status = "completed";
    const paymentMatch = buildMatchStage(clinicId, doctorId, "paidAt", startDate, endDate);
    paymentMatch.status = "success";
    const invoiceMatch = buildMatchStage(clinicId, doctorId, "issuedAt", startDate, endDate);

    const [
      totalAppointments,
      cancelledAppointments,
      noShows,
      completedConsultations,
      revenueResult,
      pendingResult
    ] = await Promise.all([
      Appointment.countDocuments(apptMatch),
      Appointment.countDocuments({ ...apptMatch, status: "cancelled" }),
      Appointment.countDocuments({ ...apptMatch, status: "no_show" }),
      Consultation.countDocuments(consultMatch),
      Payment.aggregate([
        { $match: paymentMatch },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Invoice.aggregate([
        { $match: invoiceMatch },
        { $group: { _id: null, total: { $sum: "$pendingAmount" } } }
      ])
    ]);

    // New patients (clinic wide, usually not doctor scoped unless created by doctor, but we'll use createdAt)
    const patientMatch = { clinicId: new mongoose.Types.ObjectId(clinicId) };
    if (startDate && endDate) {
      patientMatch.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const newPatients = await PatientProfile.countDocuments(patientMatch);

    return {
      totalAppointments,
      cancelledAppointments,
      noShows,
      completedConsultations,
      totalRevenue: revenueResult.length > 0 ? revenueResult[0].total : 0,
      pendingPayments: pendingResult.length > 0 ? pendingResult[0].total : 0,
      newPatients
    };
  },

  async getRevenueReport(clinicId, doctorId, startDate, endDate) {
    const paymentMatch = buildMatchStage(clinicId, doctorId, "paidAt", startDate, endDate);
    paymentMatch.status = "success";
    const invoiceMatch = buildMatchStage(clinicId, doctorId, "issuedAt", startDate, endDate);

    const [paymentStats, invoiceStats, dailyRevenue] = await Promise.all([
      Payment.aggregate([
        { $match: paymentMatch },
        { $group: { _id: null, totalCollected: { $sum: "$amount" } } }
      ]),
      Invoice.aggregate([
        { $match: invoiceMatch },
        { 
          $group: { 
            _id: null, 
            totalInvoiced: { $sum: "$totalAmount" },
            totalPending: { $sum: "$pendingAmount" },
            paidInvoices: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
            partiallyPaidInvoices: { $sum: { $cond: [{ $eq: ["$status", "partially_paid"] }, 1, 0] } }
          } 
        }
      ]),
      Payment.aggregate([
        { $match: paymentMatch },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt", timezone: "Asia/Kolkata" } },
            revenue: { $sum: "$amount" }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      summary: {
        totalCollected: paymentStats.length > 0 ? paymentStats[0].totalCollected : 0,
        totalInvoiced: invoiceStats.length > 0 ? invoiceStats[0].totalInvoiced : 0,
        totalPending: invoiceStats.length > 0 ? invoiceStats[0].totalPending : 0,
        paidInvoices: invoiceStats.length > 0 ? invoiceStats[0].paidInvoices : 0,
        partiallyPaidInvoices: invoiceStats.length > 0 ? invoiceStats[0].partiallyPaidInvoices : 0,
      },
      trend: dailyRevenue.map(d => ({ date: d._id, revenue: d.revenue }))
    };
  },

  async getAppointmentReport(clinicId, doctorId, startDate, endDate) {
    const apptMatch = buildMatchStage(clinicId, doctorId, "appointmentDate", startDate, endDate);

    const [statusCounts, dailyTrend] = await Promise.all([
      Appointment.aggregate([
        { $match: apptMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Appointment.aggregate([
        { $match: apptMatch },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate", timezone: "Asia/Kolkata" } },
            },
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
            noShow: { $sum: { $cond: [{ $eq: ["$status", "no_show"] }, 1, 0] } }
          }
        },
        { $sort: { "_id.date": 1 } }
      ])
    ]);

    const statusMap = { scheduled: 0, confirmed: 0, completed: 0, cancelled: 0, no_show: 0 };
    statusCounts.forEach(s => {
      if (statusMap[s._id] !== undefined) statusMap[s._id] = s.count;
    });

    return {
      summary: statusMap,
      trend: dailyTrend.map(d => ({
        date: d._id.date,
        appointments: d.total,
        completed: d.completed,
        cancelled: d.cancelled,
        noShow: d.noShow
      }))
    };
  },

  async getDoctorPerformanceReport(clinicId, startDate, endDate) {
    // This report is usually for clinic owners, showing all doctors
    const apptMatch = buildMatchStage(clinicId, null, "appointmentDate", startDate, endDate);
    
    // Aggregate appointments (total, patients seen, no-shows)
    const doctorStats = await Appointment.aggregate([
      { $match: apptMatch },
      {
        $group: {
          _id: "$doctorId",
          appointments: { $sum: 1 },
          noShows: { $sum: { $cond: [{ $eq: ["$status", "no_show"] }, 1, 0] } },
          patientsSeen: { $addToSet: "$patientId" } // Will count size later
        }
      }
    ]);

    const consultMatch = buildMatchStage(clinicId, null, "createdAt", startDate, endDate);
    consultMatch.status = "completed";
    const consultStats = await Consultation.aggregate([
      { $match: consultMatch },
      { $group: { _id: "$doctorId", completedConsultations: { $sum: 1 } } }
    ]);

    const paymentMatch = buildMatchStage(clinicId, null, "paidAt", startDate, endDate);
    paymentMatch.status = "success";
    // Payments are tied to Invoices, which have doctorId. We should join with Invoice to get doctorId, or assume payment has it.
    // Wait, the Payment model does not have doctorId, it has invoiceId! Let's check Payment.js.
    // Yes, Payment.js has clinicId, paymentCode, invoiceId, patientId, appointmentId. We can join Appointment to get doctorId.
    const revenueStats = await Payment.aggregate([
      { $match: { clinicId: new mongoose.Types.ObjectId(clinicId), status: "success", paidAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
      {
        $lookup: {
          from: "appointments",
          localField: "appointmentId",
          foreignField: "_id",
          as: "appointment"
        }
      },
      { $unwind: "$appointment" },
      {
        $group: {
          _id: "$appointment.doctorId",
          revenue: { $sum: "$amount" }
        }
      }
    ]);

    // Fetch doctor profiles to get names
    const doctorIds = doctorStats.map(d => d._id).filter(Boolean);
    const doctors = await DoctorProfile.find({ _id: { $in: doctorIds } }, "userId").populate("userId", "name");

    const doctorMap = {};
    doctors.forEach(doc => {
      doctorMap[doc._id.toString()] = doc.userId?.name || "Unknown Doctor";
    });

    return doctorStats.map(stat => {
      const docIdStr = stat._id.toString();
      const consult = consultStats.find(c => c._id.toString() === docIdStr);
      const rev = revenueStats.find(r => r._id.toString() === docIdStr);
      
      return {
        doctorId: docIdStr,
        doctorName: doctorMap[docIdStr] || "Unknown",
        appointments: stat.appointments,
        completedConsultations: consult ? consult.completedConsultations : 0,
        patientsSeen: stat.patientsSeen.length,
        revenue: rev ? rev.revenue : 0,
        noShows: stat.noShows
      };
    });
  },

  async getPatientReport(clinicId, doctorId, startDate, endDate) {
    const apptMatch = buildMatchStage(clinicId, doctorId, "appointmentDate", startDate, endDate);
    
    // Total patients seen in this period
    const totalPatientsAgg = await Appointment.aggregate([
      { $match: apptMatch },
      { $group: { _id: "$patientId" } },
      { $count: "count" }
    ]);
    const totalPatients = totalPatientsAgg.length > 0 ? totalPatientsAgg[0].count : 0;

    // New patients registered in this period
    const patientMatch = { clinicId: new mongoose.Types.ObjectId(clinicId) };
    if (startDate && endDate) {
      patientMatch.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const newPatients = await PatientProfile.countDocuments(patientMatch);

    // Returning Patients: patients who had an appointment in this period AND had an appointment BEFORE this period
    let returningPatients = 0;
    if (startDate) {
       const returningPatientsAgg = await Appointment.aggregate([
         { $match: { clinicId: new mongoose.Types.ObjectId(clinicId), ...(doctorId ? { doctorId: new mongoose.Types.ObjectId(doctorId) } : {}) } },
         {
           $group: {
             _id: "$patientId",
             firstAppt: { $min: "$appointmentDate" },
             hasApptInPeriod: {
               $max: {
                 $cond: [
                   { $and: [ { $gte: ["$appointmentDate", new Date(startDate)] }, { $lte: ["$appointmentDate", new Date(endDate)] } ] },
                   1,
                   0
                 ]
               }
             }
           }
         },
         {
           $match: {
             hasApptInPeriod: 1,
             firstAppt: { $lt: new Date(startDate) }
           }
         },
         { $count: "count" }
       ]);
       returningPatients = returningPatientsAgg.length > 0 ? returningPatientsAgg[0].count : 0;
    }

    return {
      totalPatients,
      newPatients,
      returningPatients
    };
  }
};
