import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { updateNotificationSettings } from "@/backend/services/settingsService";
import { canManageClinicSettings } from "@/backend/utils/permissions";
import { connectDB } from "@/backend/database/connectDB";

export async function PATCH(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || !user.clinicId || !canManageClinicSettings(user)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();
    const updated = await updateNotificationSettings(user.clinicId, user.id, data);
    
    return NextResponse.json({ success: true, notificationSettings: updated });
  } catch (error) {
    console.error("PATCH /api/settings/notifications Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
