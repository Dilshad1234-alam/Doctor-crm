import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { checkInAppointment } from "@/backend/services/queueService";
import { checkInSchema } from "@/backend/validations/queueValidation";

export async function POST(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;
    const body = await request.json().catch(() => ({}));
    
    const validatedData = checkInSchema.parse(body);

    const queueEntry = await checkInAppointment(authUser, appointmentId, validatedData);

    return NextResponse.json(
      { 
        success: true, 
        message: "Patient checked in successfully", 
        queueEntry 
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: error.message || "Failed to check in patient" },
      { status: error.status || 400 }
    );
  }
}
