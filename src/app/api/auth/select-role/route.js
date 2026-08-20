import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { findUserById } from "@/backend/repositories/userRepository";
import { assignRole } from "@/backend/services/authService";
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

    // Call assignRole service which handles migration and token generation
    const accountType = role === "clinic_owner" ? "clinic" : role;
    const { token, user } = await assignRole(dbUser._id, accountType);

    await setAuthCookie(token);

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
