import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { createStaff, getStaffList } from "@/backend/services/staffService";
import { connectDB } from "@/backend/database/connectDB";

export async function POST(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const input = await request.json();
    const staff = await createStaff(user, input);

    return NextResponse.json({ success: true, staff }, { status: 201 });
  } catch (error) {
    console.error("POST /api/staff Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = {
      search: searchParams.get("search") || "",
      role: searchParams.get("role") || "all",
      status: searchParams.get("status") || "all",
    };

    const data = await getStaffList(user, query);

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("GET /api/staff Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
