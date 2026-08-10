import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { callQueueEntry } from "@/backend/services/queueService";

export async function PATCH(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { queueId } = await params;
    const queueEntry = await callQueueEntry(authUser, queueId);

    return NextResponse.json({ 
      success: true, 
      message: "Patient called successfully",
      queueEntry 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to call patient" },
      { status: 400 }
    );
  }
}
