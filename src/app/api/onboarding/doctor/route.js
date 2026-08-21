import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import User from "@/backend/models/User";
import mongoose from "mongoose";
import DoctorProfile from "@/backend/models/DoctorProfile";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser || authUser.accountType !== "doctor") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      // Step 1
      fullName,
      dateOfBirth,
      gender,
      phone,
      email,
      // Step 2
      specialty,
      subSpecialty,
      experienceYears,
      consultationFee,
      qualification,
      registrationNumber,
      bio,
      // Step 3
      profilePhoto,
      medicalLicense,
      degreeCertificate,
      idProof
    } = body;

    await connectDB();
    
    // Auth user is now from User collection
    const dbUser = await User.findById(authUser.accountId);
    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User account not found" }, { status: 404 });
    }
    
    // Prevent duplicate DoctorProfile
    const existingProfile = await DoctorProfile.findOne({ userId: dbUser._id });
    if (existingProfile) {
      return NextResponse.json({ success: false, message: "Doctor profile already setup" }, { status: 400 });
    }

    // Create the Doctor Profile
    await DoctorProfile.create({
      userId: dbUser._id,
      title: "Dr.",
      specialization: specialty || "General Medicine",
      subSpecialization: subSpecialty || "",
      qualification: qualification ? [qualification] : [],
      registrationNumber: registrationNumber || "",
      experienceYears: parseInt(experienceYears) || 0,
      consultationFee: parseInt(consultationFee) || 0,
      phone: phone || dbUser.phone,
      gender: gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      profileImage: profilePhoto || "",
      bio: bio || "",
      documents: {
        medicalLicense: medicalLicense || "",
        degreeCertificate: degreeCertificate || "",
        idProof: idProof || "",
      },
      createdById: dbUser._id,
      createdByModel: "User",
      isActive: true,
    });

    // Update User basic info
    await User.updateOne(
      { _id: dbUser._id },
      {
        $set: {
          name: fullName || dbUser.name,
          phone: phone || dbUser.phone,
        }
      }
    );

    // We no longer need to reissue token just for onboarding since JWT only holds accountId = User._id
    // getAuthenticatedUser automatically resolves the profile on next request.

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
