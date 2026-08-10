import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getPrescription, finalizePrescription } from "@/backend/services/prescriptionService";
import { finalizePrescriptionSchema } from "@/backend/validations/prescriptionValidation";

function sanitizePrescription(c) {
  if (!c) return null;
  return {
    id: c._id,
    prescriptionCode: c.prescriptionCode,
    consultationId: c.consultationId._id || c.consultationId,
    patient: c.patientId,
    doctor: c.doctorId,
    medicines: c.medicines,
    generalInstructions: c.generalInstructions,
    recommendedTests: c.recommendedTests,
    followUp: c.followUp,
    status: c.status,
    finalizedAt: c.finalizedAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt
  };
}

export async function POST(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const unwrappedParams = await params;
    const { prescriptionId } = unwrappedParams;
    const body = await request.json().catch(() => ({}));
    
    const validatedData = finalizePrescriptionSchema.parse(body);
    await finalizePrescription(authUser, prescriptionId, validatedData);

    const updated = await getPrescription(authUser, prescriptionId);

    return NextResponse.json({ 
      success: true, 
      message: "Prescription finalized successfully",
      prescription: sanitizePrescription(updated) 
    });

  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: "Validation failed", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
