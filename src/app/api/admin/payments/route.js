import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";

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

    const { default: Payment } = await import("@/backend/models/Payment");

    const payments = await Payment.find()
      .populate("clinicId", "name")
      .populate("patientId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Payment.countDocuments();
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      payments,
      pagination: { total, pages, page, limit }
    });
  } catch (error) {
    console.error("Admin payments error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
