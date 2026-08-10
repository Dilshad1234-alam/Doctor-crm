import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getPatientConsultations } from "@/backend/services/consultationService";

function sanitizeList(list) {
  return list.map(c => ({
    id: c._id,
    consultationCode: c.consultationCode,
    appointment: c.appointmentId,
    doctor: c.doctorId,
    diagnoses: c.diagnoses,
    status: c.status,
    completedAt: c.completedAt,
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

    const consultations = await getPatientConsultations(authUser, patientId, query);

    return NextResponse.json({ success: true, consultations: sanitizeList(consultations) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
