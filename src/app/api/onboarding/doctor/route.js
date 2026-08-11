import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { findUserById, updateUserById } from "@/backend/repositories/userRepository";
import Clinic from "@/backend/models/Clinic";
import DoctorProfile from "@/backend/models/DoctorProfile";
import mongoose from "mongoose";
import { createAuthToken } from "@/backend/utils/auth";
import { setAuthCookie } from "@/backend/utils/authCookie";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser || authUser.role !== "doctor") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, specialization, qualification, registrationNumber, experienceYears, consultationFee, languages } = body;

    const dbUser = await findUserById(authUser.id);
    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    
    if (dbUser.onboardingCompleted || dbUser.doctorId) {
      return NextResponse.json({ success: false, message: "Doctor profile already setup" }, { status: 400 });
    }

    // 1. Create a personal clinic for the standalone doctor to maintain CRM architecture
    const clinic = await Clinic.create({
      name: `${dbUser.name}'s Clinic`,
      email: dbUser.email,
      phone: phone || "",
      address: { city: "Pending", state: "Pending" },
      isActive: true,
      ownerId: dbUser._id,
    });

    // 2. Create the Doctor Profile
    const doctorProfile = await DoctorProfile.create({
      clinicId: clinic._id,
      userId: dbUser._id,
      employeeId: `DOC-${Date.now().toString().slice(-6)}`,
      specialization: specialization,
      qualification: [qualification],
      registrationNumber: registrationNumber,
      experienceYears: parseInt(experienceYears) || 0,
      consultationFee: parseInt(consultationFee) || 0,
      phone: phone || dbUser.phone,
      languages: languages ? [languages] : [],
      createdByUserId: dbUser._id,
      isActive: true,
    });

    // 3. Update User
    await updateUserById(dbUser._id, {
      phone: phone,
      clinicId: clinic._id,
      doctorId: doctorProfile._id,
      onboardingCompleted: true
    });

    // Generate new token with updated clinicId and doctorId
    const newToken = createAuthToken({
      userId: dbUser._id,
      role: dbUser.role,
      clinicId: clinic._id,
      doctorId: doctorProfile._id,
      staffId: dbUser.staffId,
    });

    await setAuthCookie(newToken);

    return NextResponse.json(
      { success: true, message: "Doctor profile completed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Doctor onboarding error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
