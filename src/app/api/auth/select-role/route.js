import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { updateUserById, findUserById } from "@/backend/repositories/userRepository";
import { createAuthToken } from "@/backend/utils/auth";
import { setAuthCookie } from "@/backend/utils/authCookie";

export const runtime = "nodejs";

const ALLOWED_PUBLIC_ROLES = ["doctor", "patient", "clinic_owner"];

export async function PATCH(request) {
  try {
    const authUser = await getAuthenticatedUser();
    
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !ALLOWED_PUBLIC_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role selected" },
        { status: 400 }
      );
    }

    const dbUser = await findUserById(authUser.id);
    
    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (dbUser.role !== "unassigned") {
      return NextResponse.json(
        { success: false, message: "Account type has already been selected." },
        { status: 403 }
      );
    }

    // Update role
    await updateUserById(dbUser._id, { role });

    // Generate new token with updated role
    const newToken = createAuthToken({
      userId: dbUser._id,
      role: role,
      clinicId: dbUser.clinicId,
      doctorId: dbUser.doctorId,
      staffId: dbUser.staffId,
    });

    await setAuthCookie(newToken);

    return NextResponse.json(
      { success: true, message: "Role selected successfully", role },
      { status: 200 }
    );
  } catch (error) {
    console.error("Select role error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
