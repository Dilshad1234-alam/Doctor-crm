import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { rescheduleAppointment } from "@/backend/services/appointmentService";
import { rescheduleAppointmentSchema } from "@/backend/validations/appointmentValidation";
import { connectDB as connectToDatabase } from "@/backend/database/connectDB";

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const unwrappedParams = await params;
    
    const body = await request.json();
    const parsedData = rescheduleAppointmentSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ success: false, errors: parsedData.error.format() }, { status: 400 });
    }

    const appointment = await rescheduleAppointment(authUser, unwrappedParams.appointmentId, parsedData.data);
    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message, code: error.code }, { status: error.status || 500 });
  }
}
