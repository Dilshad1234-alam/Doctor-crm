import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getSettings } from "@/backend/services/settingsService";
import { connectDB } from "@/backend/database/connectDB";

export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || !user.clinicId) {
      return NextResponse.json({ success: false, message: "Unauthorized or no clinic found" }, { status: 403 });
    }

    const { clinic, settings } = await getSettings(user.clinicId);
    
    return NextResponse.json({ success: true, clinic, settings });
  } catch (error) {
    console.error("GET /api/settings Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
