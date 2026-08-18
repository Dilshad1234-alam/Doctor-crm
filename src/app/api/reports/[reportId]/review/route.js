import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { reviewReport } from "@/backend/services/reportService";
import { reviewReportSchema } from "@/backend/validations/reportValidation";

export async function POST(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const { reportId } = await params;

    const body = await request.json();
    const parsedData = reviewReportSchema.parse(body);

    const report = await reviewReport(authUser, reportId, parsedData);
    return NextResponse.json({ success: true, report });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to review report" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
