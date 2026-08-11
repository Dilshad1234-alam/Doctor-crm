import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { updateStaffPermissions } from "@/backend/services/staffService";
import { connectDB } from "@/backend/database/connectDB";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { staffId } = await params;
    const { permissions } = await request.json();
    const staff = await updateStaffPermissions(user, staffId, permissions);

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error(`PATCH /api/staff/permissions Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
