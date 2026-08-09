import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { changeDoctorStatus } from "@/backend/services/doctorService";
import { z } from "zod";

const statusSchema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { doctorId } = await params;
    const body = await request.json();
    const validatedData = statusSchema.parse(body);

    const doctor = await changeDoctorStatus(authUser, doctorId, validatedData.isActive);

    return NextResponse.json({ success: true, message: "Doctor status updated successfully", doctor });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation failed" },
        { status: 400 }
      );
    }
    if (error.message === "Unauthorized to edit this doctor" || error.message === "Doctor not found") {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update doctor status" },
      { status: 400 }
    );
  }
}
