import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { 
  createOrGetPrescription, 
  getPrescriptionByConsultation 
} from "@/backend/services/prescriptionService";

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

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const unwrappedParams = await params;
    const { consultationId } = unwrappedParams;
    const prescription = await getPrescriptionByConsultation(authUser, consultationId);

    return NextResponse.json({ success: true, prescription: sanitizePrescription(prescription) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function POST(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const unwrappedParams = await params;
    const { consultationId } = unwrappedParams;
    
    const prescription = await createOrGetPrescription(authUser, consultationId);

    return NextResponse.json({ success: true, prescription: sanitizePrescription(prescription) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
