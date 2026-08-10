import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { findQueueEntryByAppointment } from "@/backend/repositories/queueRepository";
import { connectDB } from "@/backend/database/connectDB";

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { appointmentId } = await params;
    
    // Fetch the active queue entry for this appointment
    const queueEntry = await findQueueEntryByAppointment(appointmentId, authUser.clinicId, [
      "checked_in", "waiting", "called", "in_consultation", "skipped"
    ]);

    return NextResponse.json({ success: true, queueEntry });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch queue entry" },
      { status: 400 }
    );
  }
}
