import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getDoctorSummary } from "@/backend/services/doctorService";

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { doctorId } = await params;
    const summary = await getDoctorSummary(authUser, doctorId);

    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    if (error.message === "Doctor not found or unauthorized") {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch doctor summary" },
      { status: 500 }
    );
  }
}
