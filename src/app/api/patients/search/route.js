import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { searchPatientsForClinic } from "@/backend/services/patientService";

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || !["clinic_owner", "doctor", "receptionist", "assistant"].includes(authUser.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    
    const patients = await searchPatientsForClinic(authUser, q);

    return NextResponse.json({ success: true, patients }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
