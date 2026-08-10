import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { findReportsByClinic } from "@/backend/repositories/reportRepository";
import { reportListQuerySchema } from "@/backend/validations/reportValidation";

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsedQuery = reportListQuerySchema.parse(query);

    const reports = await findReportsByClinic(authUser.clinicId, parsedQuery);

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch reports" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
