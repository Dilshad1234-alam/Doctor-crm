import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import Clinic from "@/backend/models/Clinic";

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
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } }
      ];
    }

    const clinics = await Clinic.find(query)
      .populate("ownerId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Clinic.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      clinics,
      pagination: { total, pages, page, limit }
    });
  } catch (error) {
    console.error("Admin clinics error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
