import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    
    if (!user || user.role !== "patient") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // For now, return safe empty state data.
    return NextResponse.json({
      success: true,
      data: {
        upcomingAppointments: 0,
        pastVisits: 0,
        prescriptions: 0,
        medicalReports: 0,
        pendingBills: 0
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Patient dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
