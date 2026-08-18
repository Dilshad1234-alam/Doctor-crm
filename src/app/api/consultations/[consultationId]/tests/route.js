import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getConsultationTests } from "@/backend/services/testService";

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const { consultationId } = await params;

    const tests = await getConsultationTests(authUser, consultationId);

    return NextResponse.json({ success: true, tests });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch consultation tests" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
