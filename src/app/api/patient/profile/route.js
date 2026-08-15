import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import PatientProfile from "@/backend/models/PatientProfile";
import User from "@/backend/models/User";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    
    if (!user || user.role !== "patient") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { patientId, clinicId } = user;

    const patientProfile = await PatientProfile.findOne({
      _id: patientId,
      clinicId: clinicId
    }).populate("userId", "name email phoneNumber profileImageUrl").lean();

    if (!patientProfile) {
      return NextResponse.json({ success: false, message: "Patient profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: patientProfile }, { status: 200 });

  } catch (error) {
    console.error("Patient profile GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load patient profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    
    if (!user || user.role !== "patient") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { patientId, clinicId } = user;
    const updateData = await request.json();

    // Prevent restricted fields from being updated
    delete updateData.userId;
    delete updateData.clinicId;
    delete updateData.role;
    delete updateData._id;

    // We can allow them to update specific things inside PatientProfile
    // For example: address, emergencyContact, allergies, currentMedicines, etc.
    const session = await mongoose.startSession();
    let updatedProfile;
    try {
      session.startTransaction();

      // If they are trying to update basic User info (name, phoneNumber), update User model
      if (updateData.name || updateData.phoneNumber) {
        const userUpdate = {};
        if (updateData.name) userUpdate.name = updateData.name;
        if (updateData.phoneNumber) userUpdate.phoneNumber = updateData.phoneNumber;

        await User.findByIdAndUpdate(user.id || user._id, userUpdate, { session });
        
        // Remove from PatientProfile update payload
        delete updateData.name;
        delete updateData.phoneNumber;
      }

      updatedProfile = await PatientProfile.findOneAndUpdate(
        { _id: patientId, clinicId: clinicId },
        { $set: updateData },
        { new: true, session, runValidators: true }
      ).populate("userId", "name email phoneNumber profileImageUrl").lean();

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    if (!updatedProfile) {
      return NextResponse.json({ success: false, message: "Patient profile not found or could not be updated" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedProfile }, { status: 200 });

  } catch (error) {
    console.error("Patient profile PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update patient profile" },
      { status: 500 }
    );
  }
}
