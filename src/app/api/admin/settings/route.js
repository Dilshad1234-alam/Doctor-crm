import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import PlatformSettings from "@/backend/models/PlatformSettings";

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    let settings = await PlatformSettings.findOne({}).lean();
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = new PlatformSettings({});
      await defaultSettings.save();
      settings = await PlatformSettings.findOne({}).lean();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Fetch platform settings error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { platformName, supportEmail, supportPhone, notifications, security } = body;

    await connectDB();

    let settings = await PlatformSettings.findOne({});
    if (!settings) {
      settings = new PlatformSettings({});
    }

    settings.platformName = platformName ?? settings.platformName;
    settings.supportEmail = supportEmail ?? settings.supportEmail;
    settings.supportPhone = supportPhone ?? settings.supportPhone;
    
    if (notifications) {
      settings.notifications.emailEnabled = notifications.emailEnabled ?? settings.notifications.emailEnabled;
      settings.notifications.smsEnabled = notifications.smsEnabled ?? settings.notifications.smsEnabled;
    }

    if (security) {
      settings.security.requireStrongPasswords = security.requireStrongPasswords ?? settings.security.requireStrongPasswords;
      settings.security.sessionTimeoutMinutes = security.sessionTimeoutMinutes ?? settings.security.sessionTimeoutMinutes;
    }

    await settings.save();

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Update platform settings error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
