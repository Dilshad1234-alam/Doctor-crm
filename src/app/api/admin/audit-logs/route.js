import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import AuditLog from "@/backend/models/AuditLog";
import User from "@/backend/models/User"; // Ensure registered for populate
import ClinicProfile from "@/backend/models/ClinicProfile"; // Ensure registered for populate

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const logs = await AuditLog.find({})
      .populate("userId", "name email role")
      .populate("clinicId", "name email")
      .sort({ createdAt: -1 })
      .limit(100) // limit for safety in MVP
      .lean();

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Fetch audit logs error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
