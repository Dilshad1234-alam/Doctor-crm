import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { uploadReport, getPatientReports } from "@/backend/services/reportService";
import { reportListQuerySchema, createReportSchema } from "@/backend/validations/reportValidation";

export async function POST(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const { patientId } = params;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ success: false, message: "File is required" }, { status: 400 });
    }

    const payload = {
      title: formData.get("title"),
      reportType: formData.get("reportType"),
      reportDate: formData.get("reportDate"),
      notes: formData.get("notes") || undefined,
      recommendedTestId: formData.get("recommendedTestId") || undefined
    };

    const parsedData = createReportSchema.parse(payload);

    const report = await uploadReport(authUser, patientId, parsedData, file);
    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to upload report" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const { patientId } = params;

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsedQuery = reportListQuerySchema.parse(query);

    const reports = await getPatientReports(authUser, patientId, parsedQuery);

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch reports" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
