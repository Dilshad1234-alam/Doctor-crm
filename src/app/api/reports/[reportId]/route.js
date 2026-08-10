import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getReport, updateReport } from "@/backend/services/reportService";
import { updateReportSchema } from "@/backend/validations/reportValidation";

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const { reportId } = params;

    const report = await getReport(authUser, reportId);
    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch report" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const { reportId } = params;

    const body = await request.json();
    const parsedData = updateReportSchema.parse(body);

    const report = await updateReport(authUser, reportId, parsedData);
    return NextResponse.json({ success: true, report });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update report" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
