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

    // A clinicId is technically required by the schema for a doctor profile (since every doctor belongs to a clinic).
    // For standalone doctors, they shouldn't just "create" a clinic blindly anymore without a proper clinic account.
    // However, if the business logic expects standalone doctors to have a dummy clinic or they must be invited, 
    // the previous logic created a Clinic here. Since `OwnerId` no longer exists, we should reconsider this.
    // For now, let's allow it to create a Clinic account as a standalone practice to maintain old behavior.
    const { default: Clinic } = await import("@/backend/models/Clinic");
    const { default: ClinicProfile } = await import("@/backend/models/ClinicProfile");
    
    const clinicName = `${fullName || dbDoctor.name}'s Clinic`;
    const newClinic = await Clinic.create({
      name: clinicName,
      email: `clinic_${Date.now()}@clinora.com`, // dummy unique email
      phone: phone || "",
      password: "dummy_password_hash_since_not_loginable_directly",
      isActive: true,
    });
    
    await ClinicProfile.create({
      clinicId: newClinic._id,
      address: { city: "Pending", state: "Pending" },
      onboardingCompleted: true,
    });

    // Create the Doctor Profile
    await DoctorProfile.create({
      clinicId: newClinic._id,
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
