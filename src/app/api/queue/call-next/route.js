import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { callNextPatient } from "@/backend/services/queueService";

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const queueEntry = await callNextPatient(authUser);

    return NextResponse.json({ 
      success: true, 
      message: "Patient called successfully",
      queueEntry 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to call next patient" },
      { status: 400 }
    );
  }
}
