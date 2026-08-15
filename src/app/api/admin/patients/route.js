import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import PatientProfile from "@/backend/models/PatientProfile";

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

    const patients = await PatientProfile.find()
      .populate("userId", "name email phone isActive")
      .populate("clinicId", "name address")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await PatientProfile.countDocuments();
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      patients,
      pagination: { total, pages, page, limit }
    });
  } catch (error) {
    console.error("Admin patients error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
