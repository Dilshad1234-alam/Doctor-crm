import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import Appointment from "@/backend/models/Appointment";
import DoctorProfile from "@/backend/models/DoctorProfile";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    
    if (!user || user.role !== "patient") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { patientId, clinicId } = user;

    // 1. Find all unique doctorIds from this patient's appointments
    const appointments = await Appointment.find({
      patientId: patientId,
      clinicId: clinicId
    }).select("doctorId").lean();

    const doctorIds = [...new Set(appointments.map(app => app.doctorId.toString()))];

    if (doctorIds.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // 2. Fetch those doctors' profiles, populate User details
    const doctors = await DoctorProfile.find({
      _id: { $in: doctorIds },
      clinicId: clinicId
    })
      .populate("userId", "name email phoneNumber profileImageUrl")
      .lean();

    return NextResponse.json({ success: true, data: doctors }, { status: 200 });

  } catch (error) {
    console.error("Patient doctors error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load doctors" },
      { status: 500 }
    );
  }
}
