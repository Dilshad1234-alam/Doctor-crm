import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getMyPrescriptions } from "@/backend/services/prescriptionService";

function sanitizeList(list) {
  return list.map(c => ({
    id: c._id,
    prescriptionCode: c.prescriptionCode,
    consultationId: c.consultationId._id || c.consultationId,
    patient: c.patientId,
    status: c.status,
    finalizedAt: c.finalizedAt,
    createdAt: c.createdAt,
  }));
}

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser || authUser.role !== "doctor") {
       return NextResponse.json({ success: false, message: "Unauthorized. Doctor only." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const prescriptions = await getMyPrescriptions(authUser, query);

    return NextResponse.json({ success: true, prescriptions: sanitizeList(prescriptions) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
