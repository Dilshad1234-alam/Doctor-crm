import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getPatientHistory } from "@/backend/repositories/patientHistoryRepository";
import { findPatientById } from "@/backend/repositories/patientRepository";

export async function GET(request, { params }) {
  try {
    const { patientId } = await params;
    const authUser = await getAuthenticatedUser(request);
    
    if (!authUser || !["clinic_owner", "doctor", "receptionist", "assistant"].includes(authUser.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const type = searchParams.get("type");

    // Check patient exists and belongs to clinic
    const patient = await findPatientById(patientId, authUser.clinicId);
    if (!patient) {
      return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });
    }

    const data = await getPatientHistory(patientId, authUser.clinicId, { page: Number(page), limit: Number(limit), type });

    return NextResponse.json({ success: true, ...data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
