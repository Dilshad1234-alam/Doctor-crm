import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { updateOwnDoctorAvailability } from "@/backend/services/doctorService";
import { doctorAvailabilitySchema } from "@/backend/validations/doctorValidation";
import { ACCOUNT_TYPES } from "@/backend/utils/permissions";
import { z } from "zod";

const inputSchema = z.object({
  availability: doctorAvailabilitySchema,
});

export async function PATCH(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser || authUser.accountType !== ACCOUNT_TYPES.DOCTOR || !authUser.doctorId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = inputSchema.parse(body);

    const doctor = await updateOwnDoctorAvailability(authUser, validatedData);

    return NextResponse.json({ success: true, message: "Availability updated successfully", doctor });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update availability" },
      { status: 400 }
    );
  }
}
