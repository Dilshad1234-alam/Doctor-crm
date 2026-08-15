import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import Clinic from "@/backend/models/Clinic";
import DoctorProfile from "@/backend/models/DoctorProfile";
import PatientProfile from "@/backend/models/PatientProfile";
import Appointment from "@/backend/models/Appointment";
import StaffProfile from "@/backend/models/StaffProfile";

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const [
      totalClinics, activeClinics, pendingClinics, suspendedClinics,
      totalDoctors, totalPatients, totalStaff,
      totalAppointments, todayAppointments
    ] = await Promise.all([
      Clinic.countDocuments(),
      Clinic.countDocuments({ status: "active" }),
      Clinic.countDocuments({ status: "pending" }),
      Clinic.countDocuments({ status: "suspended" }),
      DoctorProfile.countDocuments(),
      PatientProfile.countDocuments(),
      StaffProfile.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    ]);

    // For revenue, we could sum the amount from Payment where status="success"
    // Since payment model might require aggregation:
    const { default: Payment } = await import("@/backend/models/Payment");
    let revenue = 0;
    try {
      const revenueAgg = await Payment.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
    } catch (e) {
      console.warn("Could not calculate revenue:", e);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalClinics,
        activeClinics,
        pendingClinics,
        suspendedClinics,
        totalDoctors,
        totalPatients,
        totalStaff,
        todayAppointments,
        totalAppointments,
        revenue,
        subscriptionRevenue: 0 // Mock placeholder
      }
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
