import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getDoctorDetails } from "@/backend/services/doctorService";
import { ACCOUNT_TYPES } from "@/backend/utils/permissions";

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser || authUser.accountType !== ACCOUNT_TYPES.DOCTOR || !authUser.doctorId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const doctor = await getDoctorDetails(authUser, authUser.doctorId);

    return NextResponse.json({ success: true, doctor });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
