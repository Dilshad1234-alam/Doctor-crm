import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { findUserById, updateUserById } from "@/backend/repositories/userRepository";
import PatientProfile from "@/backend/models/PatientProfile";
import { createAuthToken } from "@/backend/utils/auth";
import { setAuthCookie } from "@/backend/utils/authCookie";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser || authUser.role !== "patient") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, dateOfBirth, gender } = body;

    const dbUser = await findUserById(authUser.id);
    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    
    if (dbUser.onboardingCompleted) {
      return NextResponse.json({ success: false, message: "Patient profile already setup" }, { status: 400 });
    }

    // Create the Patient Profile
    await PatientProfile.create({
      userId: dbUser._id,
      dateOfBirth: new Date(dateOfBirth),
      gender: gender,
    });

    // Update User
    await updateUserById(dbUser._id, {
      phone: phone || dbUser.phone,
      onboardingCompleted: true
    });

    // Generate new token
    const newToken = createAuthToken({
      userId: dbUser._id,
      role: dbUser.role,
      clinicId: dbUser.clinicId,
      doctorId: dbUser.doctorId,
      staffId: dbUser.staffId,
    });

    await setAuthCookie(newToken);

    return NextResponse.json(
      { success: true, message: "Patient profile completed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Patient onboarding error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
