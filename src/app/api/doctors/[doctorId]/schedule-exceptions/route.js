import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { findScheduleExceptions, createScheduleException } from "@/backend/repositories/doctorScheduleRepository";
import { canManageDoctorSchedule } from "@/backend/utils/permissions";
import { scheduleExceptionSchema } from "@/backend/validations/doctorValidation";
import { findDoctorById } from "@/backend/repositories/doctorRepository";

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { doctorId } = await params;
    
    // Verify permissions
    const doctor = await findDoctorById(doctorId, authUser.clinicId);
    if (!doctor || !canManageDoctorSchedule(authUser, doctor)) {
      return NextResponse.json({ success: false, message: "Doctor not found or unauthorized" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const exceptions = await findScheduleExceptions(doctorId, authUser.clinicId, { startDate, endDate });

    return NextResponse.json({ success: true, exceptions });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch schedule exceptions" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { doctorId } = await params;
    
    // Verify permissions
    const doctor = await findDoctorById(doctorId, authUser.clinicId);
    if (!doctor || !canManageDoctorSchedule(authUser, doctor)) {
      return NextResponse.json({ success: false, message: "Doctor not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = scheduleExceptionSchema.parse(body);

    const exceptionData = {
      ...validatedData,
      clinicId: authUser.clinicId,
      doctorId,
      createdByUserId: authUser.id || authUser._id,
    };

    const exception = await createScheduleException(exceptionData);

    return NextResponse.json({ success: true, message: "Schedule exception created", exception }, { status: 201 });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: "A schedule exception already exists for this date" }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create schedule exception" },
      { status: 400 }
    );
  }
}
