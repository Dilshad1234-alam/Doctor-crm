import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getAppointmentDetails, updateAppointmentStatus, rescheduleAppointment } from "@/backend/services/appointmentService";
import { connectDB as connectToDatabase } from "@/backend/database/connectDB";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const unwrappedParams = await params;

    const appointment = await getAppointmentDetails(authUser, unwrappedParams.appointmentId);
    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const unwrappedParams = await params;
    const body = await request.json();
    
    if (body.action === "status") {
      const updated = await updateAppointmentStatus(authUser, unwrappedParams.appointmentId, body.status);
      return NextResponse.json({ success: true, appointment: updated });
    } else if (body.action === "reschedule") {
      const updated = await rescheduleAppointment(authUser, unwrappedParams.appointmentId, body);
      return NextResponse.json({ success: true, appointment: updated });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
