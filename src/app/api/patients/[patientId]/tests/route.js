import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getPatientTests } from "@/backend/services/testService";

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const { patientId } = params;

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const tests = await getPatientTests(authUser, patientId, query);

    return NextResponse.json({ success: true, tests });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch tests" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
