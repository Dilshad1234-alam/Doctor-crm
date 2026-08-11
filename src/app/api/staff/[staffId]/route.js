import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getStaffDetails, updateStaff } from "@/backend/services/staffService";
import { connectDB } from "@/backend/database/connectDB";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { staffId } = await params;
    const staff = await getStaffDetails(user, staffId);

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error(`GET /api/staff Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { staffId } = await params;
    const input = await request.json();
    const staff = await updateStaff(user, staffId, input);

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error(`PATCH /api/staff Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
