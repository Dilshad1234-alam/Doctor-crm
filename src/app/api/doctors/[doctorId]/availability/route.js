import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { updateDoctorAvailabilityByOwner } from "@/backend/services/doctorService";
import { doctorAvailabilitySchema } from "@/backend/validations/doctorValidation";
import { z } from "zod";

const inputSchema = z.object({
  availability: doctorAvailabilitySchema,
});

export async function PATCH(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { doctorId } = await params;
    const body = await request.json();
    const validatedData = inputSchema.parse(body);

    const doctor = await updateDoctorAvailabilityByOwner(authUser, doctorId, validatedData);

    return NextResponse.json({ success: true, message: "Doctor availability updated", doctor });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }
    if (error.message === "Unauthorized to update this availability" || error.message === "Doctor profile not found") {
      return NextResponse.json({ success: false, message: "Doctor not found or unauthorized" }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update availability" },
      { status: 400 }
    );
  }
}
