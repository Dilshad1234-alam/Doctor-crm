import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getAppointmentDetails } from "@/backend/services/appointmentService";
import { connectDB as connectToDatabase } from "@/backend/database/connectDB";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Await params if Next.js > 15
    const unwrappedParams = await params;

    const appointment = await getAppointmentDetails(authUser, unwrappedParams.appointmentId);
    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
