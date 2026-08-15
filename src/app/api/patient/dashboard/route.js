import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import Appointment from "@/backend/models/Appointment";
import Prescription from "@/backend/models/Prescription";
import MedicalReport from "@/backend/models/MedicalReport";
import Invoice from "@/backend/models/Invoice";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    
    if (!user || user.role !== "patient") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { patientId, clinicId } = user;

    // Fetch real stats
    const now = new Date();
    
    const [
      upcomingAppointments,
      pastVisits,
      prescriptions,
      medicalReports,
      pendingBillsCount,
      pendingBillsAmountResult
    ] = await Promise.all([
      Appointment.countDocuments({ patientId, clinicId, appointmentDate: { $gte: now }, status: { $in: ["scheduled", "confirmed"] } }),
      Appointment.countDocuments({ patientId, clinicId, appointmentDate: { $lt: now }, status: "completed" }),
      Prescription.countDocuments({ patientId, clinicId, status: "finalized" }),
      MedicalReport.countDocuments({ patientId, clinicId }),
      Invoice.countDocuments({ patientId, clinicId, paymentStatus: "pending" }),
      Invoice.aggregate([
        { $match: { patientId: patientId, clinicId: clinicId, paymentStatus: "pending" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    const pendingBillsAmount = pendingBillsAmountResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: {
        upcomingAppointments,
        pastVisits,
        prescriptions,
        medicalReports,
        pendingBills: pendingBillsCount,
        pendingBillsAmount
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Patient dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
