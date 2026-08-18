import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getSettings } from "@/backend/services/settingsService";
import { connectDB } from "@/backend/database/connectDB";
import ClinicProfile from "@/backend/models/ClinicProfile";

export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || !user.clinicId) {
      return NextResponse.json({ success: false, message: "Unauthorized or no clinic found" }, { status: 403 });
    }

    const { clinic, settings } = await getSettings(user.clinicId);
    
    // Also fetch clinic profile to get logo
    const clinicProfile = await ClinicProfile.findOne({ clinicId: user.clinicId }).lean();
    const clinicWithLogo = {
      ...clinic,
      logoUrl: clinicProfile?.logoUrl || null,
      logoImageUrl: clinicProfile?.logoUrl || null,
    };
    
    return NextResponse.json({ success: true, clinic: clinicWithLogo, settings });
  } catch (error) {
    console.error("GET /api/settings Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
