import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getPatientSummary } from "@/backend/services/patientService";

export async function GET(request, { params }) {
  try {
    const { patientId } = await params;
    const authUser = await getAuthenticatedUser(request);
    
    if (!authUser || !["clinic_owner", "doctor", "receptionist", "assistant"].includes(authUser.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const data = await getPatientSummary(authUser, patientId);

    return NextResponse.json({ success: true, ...data }, { status: 200 });
  } catch (error) {
    if (error.status === 404) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
