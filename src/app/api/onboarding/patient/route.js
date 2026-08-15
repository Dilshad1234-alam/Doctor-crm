import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import Patient from "@/backend/models/Patient";
import PatientProfile from "@/backend/models/PatientProfile";
import { createAuthToken } from "@/backend/utils/auth";
import { setAuthCookie } from "@/backend/utils/authCookie";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser || authUser.accountType !== "patient") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      // Step 1 - Personal Info
      fullName,
      dateOfBirth,
      gender,
      bloodGroup,
      // Step 2 - Contact Info
      phone,
      email,
      address,
      city,
      state,
      pincode,
      // Step 3 - Health Info
      allergies,
      chronicConditions,
      currentMedicines,
      emergencyContactName,
      emergencyContactPhone,
    } = body;

    await connectDB();
    const dbPatient = await Patient.findById(authUser.accountId);
    if (!dbPatient) {
      return NextResponse.json({ success: false, message: "Patient account not found" }, { status: 404 });
    }

    const existingProfile = await PatientProfile.findOne({ patientId: dbPatient._id });
    if (existingProfile) {
      return NextResponse.json({ success: false, message: "Patient profile already setup" }, { status: 400 });
    }

    // Create the Patient Profile with extended fields
    const profileData = {
      patientId: dbPatient._id,
      dateOfBirth: new Date(dateOfBirth),
      gender: gender,
    };

    if (bloodGroup) profileData.bloodGroup = bloodGroup;

    // Optional fields
    if (allergies && allergies.length > 0) profileData.allergies = allergies;
    if (chronicConditions && chronicConditions.length > 0) profileData.chronicConditions = chronicConditions;
    if (currentMedicines && currentMedicines.length > 0) profileData.currentMedicines = currentMedicines;
    
    if (emergencyContactName || emergencyContactPhone) {
      profileData.emergencyContact = {
        name: emergencyContactName || "",
        phone: emergencyContactPhone || "",
      };
    }
    
    if (address || city || state || pincode) {
      profileData.address = { line1: address || "", city: city || "", state: state || "", pincode: pincode || "" };
    }

    await PatientProfile.create(profileData);

    // Update base Patient info
    await Patient.updateOne(
      { _id: dbPatient._id },
      {
        $set: {
          name: fullName || dbPatient.name,
          email: email || dbPatient.email,
          phone: phone || dbPatient.phone,
        }
      }
    );

    // Generate new token
    const newToken = createAuthToken({
      accountId: dbPatient._id,
      accountType: "patient",
    });

    await setAuthCookie(newToken);

    return NextResponse.json(
      { success: true, message: "Patient profile completed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Patient onboarding error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
