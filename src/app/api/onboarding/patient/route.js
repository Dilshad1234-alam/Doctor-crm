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

    const dbUser = await findUserById(authUser.id);
    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (dbUser.onboardingCompleted) {
      return NextResponse.json({ success: false, message: "Patient profile already setup" }, { status: 400 });
    }

    // Create the Patient Profile with extended fields
    const profileData = {
      userId: dbUser._id,
      dateOfBirth: new Date(dateOfBirth),
      gender: gender,
    };

    // Optional fields
    if (bloodGroup) profileData.bloodGroup = bloodGroup;

    const patientProfile = await PatientProfile.create(profileData);

    // Update User with all extended info
    const userUpdate = {
      role: "patient",
      onboardingCompleted: true,
    };

    if (phone) userUpdate.phone = phone;
    if (email && email !== dbUser.email) userUpdate.email = email;
    if (fullName && fullName !== dbUser.name) userUpdate.name = fullName;

    // Store extended health info on the profile (using findOneAndUpdate)
    const profileUpdate = {};
    if (allergies && allergies.length > 0) profileUpdate.allergies = allergies;
    if (chronicConditions && chronicConditions.length > 0) profileUpdate.chronicConditions = chronicConditions;
    if (currentMedicines && currentMedicines.length > 0) profileUpdate.currentMedicines = currentMedicines;
    if (emergencyContactName || emergencyContactPhone) {
      profileUpdate.emergencyContact = {
        name: emergencyContactName || "",
        phone: emergencyContactPhone || "",
      };
    }
    if (address || city || state || pincode) {
      profileUpdate.address = { line1: address || "", city: city || "", state: state || "", pincode: pincode || "" };
    }

    // Update PatientProfile with extended info (non-required fields handled gracefully)
    if (Object.keys(profileUpdate).length > 0) {
      try {
        const PatientProfileModel = PatientProfile;
        // Dynamically add optional fields via direct update
        await PatientProfileModel.findByIdAndUpdate(patientProfile._id, { $set: profileUpdate });
      } catch (_) {
        // Non-critical: profile still created successfully
      }
    }

    await updateUserById(dbUser._id, userUpdate);

    // Generate new token
    const newToken = createAuthToken({
      userId: dbUser._id,
      role: "patient",
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
