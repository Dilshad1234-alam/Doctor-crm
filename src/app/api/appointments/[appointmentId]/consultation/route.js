import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { 
  saveConsultationDraft, 
  completeConsultation, 
  getConsultationByAppointment 
} from "@/backend/services/consultationService";
import { 
  saveConsultationDraftSchema, 
  completeConsultationSchema 
} from "@/backend/validations/consultationValidation";

function sanitizeConsultation(c) {
  if (!c) return null;
  return {
    id: c._id,
    appointmentId: c.appointmentId,
    patientId: c.patientId,
    doctorId: c.doctorId,
    symptoms: c.symptoms,
    diagnosis: c.diagnosis,
    clinicalNotes: c.clinicalNotes,
    prescription: c.prescription,
    recommendedLabTests: c.recommendedLabTests,
    followUpDate: c.followUpDate,
    status: c.status,
    completedAt: c.completedAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    recordedBy: c.createdByUserId ? {
      id: c.createdByUserId._id,
      name: c.createdByUserId.name,
      role: c.createdByUserId.role,
    } : null
  };
}

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const unwrappedParams = await params;
    const { appointmentId } = unwrappedParams;
    const consultation = await getConsultationByAppointment(authUser, appointmentId);

    return NextResponse.json({ success: true, consultation: sanitizeConsultation(consultation) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
