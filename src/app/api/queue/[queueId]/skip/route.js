import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { skipQueueEntry } from "@/backend/services/queueService";
import { queueActionSchema } from "@/backend/validations/queueValidation";

export async function PATCH(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { queueId } = await params;
    
    // We are reusing queueActionSchema but it expects an action field. 
    // The skipQueueEntry service accepts a reason in input.
    const body = await request.json().catch(() => ({}));
    
    const queueEntry = await skipQueueEntry(authUser, queueId, body);

    return NextResponse.json({ 
      success: true, 
      message: "Patient skipped successfully",
      queueEntry 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to skip patient" },
      { status: 400 }
    );
  }
}
