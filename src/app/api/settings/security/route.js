import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { changePassword } from "@/backend/services/authService";
import { connectDB } from "@/backend/database/connectDB";

export async function PATCH(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "Both current and new passwords are required" }, { status: 400 });
    }

    await changePassword(user.id, currentPassword, newPassword);
    
    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("PATCH /api/settings/security Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
