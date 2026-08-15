import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import Appointment from "@/backend/models/Appointment";

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find()
      .populate("patientId", "name email phone")
      .populate("doctorId", "userId") // populate more if needed
      .populate("clinicId", "name")
      .sort({ appointmentDate: -1, startTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Appointment.countDocuments();
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      appointments,
      pagination: { total, pages, page, limit }
    });
  } catch (error) {
    console.error("Admin appointments error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
