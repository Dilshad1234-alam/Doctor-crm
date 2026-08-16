import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import DoctorProfile from "@/backend/models/DoctorProfile";

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

    const profiles = await DoctorProfile.find()
      .populate("doctorId", "name email phone isActive")
      .populate("clinicId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const doctors = profiles.map(p => ({
      ...p,
      userId: p.doctorId
    }));

    const total = await DoctorProfile.countDocuments();
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      doctors,
      pagination: { total, pages, page, limit }
    });
  } catch (error) {
    console.error("Admin doctors error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
