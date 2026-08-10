import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getMyConsultations } from "@/backend/services/consultationService";

function sanitizeList(list) {
  return list.map(c => ({
    id: c._id,
    consultationCode: c.consultationCode,
    appointmentId: c.appointmentId._id || c.appointmentId,
    patient: c.patientId,
    status: c.status,
    completedAt: c.completedAt,
    startedAt: c.startedAt,
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

    const consultations = await getMyConsultations(authUser, query);

    return NextResponse.json({ success: true, consultations: sanitizeList(consultations) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
