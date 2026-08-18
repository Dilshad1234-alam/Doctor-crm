import { NextResponse } from "next/server";
// Force Next.js recompile to pick up consultationService changes
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { startConsultationFromQueue } from "@/backend/services/queueService";

export async function PATCH(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { queueId } = await params;
    const consultation = await startConsultationFromQueue(authUser, queueId);

    return NextResponse.json({ 
      success: true, 
      message: "Consultation started successfully",
      consultation 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to start consultation" },
      { status: 400 }
    );
  }
}
