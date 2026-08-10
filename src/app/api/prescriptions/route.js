import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getPrescriptions } from "@/backend/services/prescriptionService";
import { prescriptionListQuerySchema } from "@/backend/validations/prescriptionValidation";

function sanitizeList(list) {
  return list.map(c => ({
    id: c._id,
    prescriptionCode: c.prescriptionCode,
    consultationId: c.consultationId._id || c.consultationId,
    patient: c.patientId,
    doctor: c.doctorId,
    status: c.status,
    finalizedAt: c.finalizedAt,
    createdAt: c.createdAt,
  }));
}

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validatedQuery = prescriptionListQuerySchema.parse(query);

    const prescriptions = await getPrescriptions(authUser, validatedQuery);

    return NextResponse.json({ success: true, prescriptions: sanitizeList(prescriptions) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
