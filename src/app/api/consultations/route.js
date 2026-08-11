import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getConsultations, getMyConsultations } from "@/backend/services/consultationService";
import { consultationListQuerySchema } from "@/backend/validations/consultationValidation";

function sanitizeList(list) {
  return list.map(c => ({
    id: c._id,
    consultationCode: c.consultationCode,
    appointmentId: c.appointmentId._id || c.appointmentId,
    patient: c.patientId,
    doctor: c.doctorId,
    status: c.status,
    completedAt: c.completedAt,
    startedAt: c.startedAt,
    createdAt: c.createdAt,
  }));
}

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validatedQuery = consultationListQuerySchema.parse(query);

    let consultations;
    if (authUser.role === "doctor") {
      consultations = await getMyConsultations(authUser, validatedQuery);
    } else {
      consultations = await getConsultations(authUser, validatedQuery);
    }

    return NextResponse.json({ success: true, consultations: sanitizeList(consultations) });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
