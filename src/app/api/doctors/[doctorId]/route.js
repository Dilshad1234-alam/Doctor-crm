import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getDoctorDetails, updateDoctorForClinic } from "@/backend/services/doctorService";
import { updateDoctorSchema } from "@/backend/validations/doctorValidation";

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { doctorId } = await params;
    const doctor = await getDoctorDetails(authUser, doctorId);

    return NextResponse.json({ success: true, doctor });
  } catch (error) {
    if (error.message === "Unauthorized access to doctor profile" || error.message === "Doctor not found") {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch doctor details" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { doctorId } = await params;
    const body = await request.json();
    const validatedData = updateDoctorSchema.parse(body);

    const doctor = await updateDoctorForClinic(authUser, doctorId, validatedData);

    return NextResponse.json({ success: true, message: "Doctor updated successfully", doctor });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }
    if (error.message === "Unauthorized to edit this doctor" || error.message === "Doctor not found") {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update doctor" },
      { status: 400 }
    );
  }
}
