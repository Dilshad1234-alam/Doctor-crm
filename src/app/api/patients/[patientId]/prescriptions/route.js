import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getPatientPrescriptions } from "@/backend/services/prescriptionService";

function sanitizeList(list) {
  return list.map(c => ({
    id: c._id,
    prescriptionCode: c.prescriptionCode,
    appointment: c.appointmentId,
    consultation: c.consultationId,
    doctor: c.doctorId,
    status: c.status,
    finalizedAt: c.finalizedAt,
    createdAt: c.createdAt,
  }));
}

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const unwrappedParams = await params;
    const { patientId } = unwrappedParams;
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const prescriptions = await getPatientPrescriptions(authUser, patientId, query);

    return NextResponse.json({ success: true, prescriptions: sanitizeList(prescriptions) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
