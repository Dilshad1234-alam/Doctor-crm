import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { markAppointmentNoShow } from "@/backend/services/appointmentService";
import { connectDB as connectToDatabase } from "@/backend/database/connectDB";

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const unwrappedParams = await params;

    const appointment = await markAppointmentNoShow(authUser, unwrappedParams.appointmentId);
    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
