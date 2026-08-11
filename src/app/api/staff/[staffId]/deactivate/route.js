import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { setStaffStatus } from "@/backend/services/staffService";
import { connectDB } from "@/backend/database/connectDB";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const staffId = params.staffId;
    const status = await setStaffStatus(user, staffId, false);

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error(`PATCH /api/staff/${params.staffId}/deactivate Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
