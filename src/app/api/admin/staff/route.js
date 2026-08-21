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

    const staff = [];

    const total = 0;
    const pages = 0;

    return NextResponse.json({
      success: true,
      staff,
      pagination: { total, pages, page, limit }
    });
  } catch (error) {
    console.error("Admin staff error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
