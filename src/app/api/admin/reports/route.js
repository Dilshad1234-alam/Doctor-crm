import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import Clinic from "@/backend/models/Clinic";
import DoctorProfile from "@/backend/models/DoctorProfile";
import PatientProfile from "@/backend/models/PatientProfile";
import StaffProfile from "@/backend/models/StaffProfile";
import Appointment from "@/backend/models/Appointment";

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    // 1. Global Counters
    const [
      totalClinics,
      totalDoctors,
      totalPatients,
      totalStaff,
      totalAppointments
    ] = await Promise.all([
      Clinic.countDocuments(),
      DoctorProfile.countDocuments(),
      PatientProfile.countDocuments(),
      StaffProfile.countDocuments(),
      Appointment.countDocuments()
    ]);

    // 2. Appointment Analytics
    // Aggregate appointment statuses
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Format into a friendly object: { scheduled: X, completed: Y, canceled: Z, ... }
    const appointmentsByStatus = {
      scheduled: 0,
      completed: 0,
      canceled: 0,
      in_progress: 0,
      no_show: 0
    };

    appointmentStats.forEach(stat => {
      if (appointmentsByStatus[stat._id] !== undefined) {
        appointmentsByStatus[stat._id] = stat.count;
      }
    });

    // 3. Recent Growth (Latest 5 Clinics)
    const recentClinics = await Clinic.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email phone createdAt")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          clinics: totalClinics,
          doctors: totalDoctors,
          patients: totalPatients,
          staff: totalStaff,
          appointments: totalAppointments
        },
        appointmentsByStatus,
        recentClinics
      }
    });
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
