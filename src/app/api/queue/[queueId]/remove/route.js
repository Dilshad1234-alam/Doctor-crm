import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { removeQueueEntry } from "@/backend/services/queueService";

export async function PATCH(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { queueId } = await params;
    const body = await request.json().catch(() => ({}));
    
    const queueEntry = await removeQueueEntry(authUser, queueId, body);

    return NextResponse.json({ 
      success: true, 
      message: "Patient removed from queue",
      queueEntry 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to remove patient" },
      { status: 400 }
    );
  }
}
