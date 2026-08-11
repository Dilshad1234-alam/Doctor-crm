import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { reportAnalyticsService } from "@/backend/services/reportAnalyticsService";

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
      // doctorId is ignored in the service for this specific route for owner
    };

    const data = await reportAnalyticsService.getDoctorPerformanceReport(authUser, filters);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch doctors report" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
