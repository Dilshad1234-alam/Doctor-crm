import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import Doctor from "@/backend/models/Doctor";
import DoctorProfile from "@/backend/models/DoctorProfile";
import { createAuthToken } from "@/backend/utils/auth";
import { setAuthCookie } from "@/backend/utils/authCookie";

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
      clinicId,
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
    const dbDoctor = await Doctor.findById(authUser.accountId);
    if (!dbDoctor) {
      return NextResponse.json({ success: false, message: "Doctor account not found" }, { status: 404 });
    }
    
    const existingProfile = await DoctorProfile.findOne({ doctorId: dbDoctor._id });
    if (existingProfile) {
      return NextResponse.json({ success: false, message: "Doctor profile already setup" }, { status: 400 });
    }

    let finalClinicId = clinicId;
    
    // If no clinicId is provided, we can either error out or create a dummy clinic. 
    // Since the user asked to link them to an existing clinic, we require it.
    if (!finalClinicId) {
      return NextResponse.json({ success: false, message: "Clinic selection is required" }, { status: 400 });
    }

    // Verify the clinic exists
    const { default: Clinic } = await import("@/backend/models/Clinic");
    const existingClinic = await Clinic.findById(finalClinicId);
    if (!existingClinic) {
      return NextResponse.json({ success: false, message: "Selected clinic not found" }, { status: 404 });
    }

    // Create the Doctor Profile
    await DoctorProfile.create({
      clinicId: finalClinicId,
      doctorId: dbDoctor._id,
      employeeId: `DOC-${Date.now().toString().slice(-6)}`,
      title: "Dr.",
      specialization: specialty || "General Medicine",
      subSpecialization: subSpecialty || "",
      qualification: qualification ? [qualification] : [],
      registrationNumber: registrationNumber || "",
      experienceYears: parseInt(experienceYears) || 0,
      consultationFee: parseInt(consultationFee) || 0,
      phone: phone || dbDoctor.phone,
      gender: gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      profileImage: profilePhoto || "",
      bio: bio || "",
      documents: {
        medicalLicense: medicalLicense || "",
        degreeCertificate: degreeCertificate || "",
        idProof: idProof || "",
      },
      createdById: dbDoctor._id,
      createdByModel: "Doctor",
      isActive: true,
    });

    // Update Doctor basic info
    await Doctor.updateOne(
      { _id: dbDoctor._id },
      {
        $set: {
          name: fullName || dbDoctor.name,
          email: email || dbDoctor.email,
          phone: phone || dbDoctor.phone,
        }
      }
    );

    // Generate new token
    const newToken = createAuthToken({
      accountId: dbDoctor._id,
      accountType: "doctor",
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
