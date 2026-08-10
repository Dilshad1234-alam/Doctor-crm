import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getConsultation, updateConsultation } from "@/backend/services/consultationService";
import { updateConsultationSchema } from "@/backend/validations/consultationValidation";

function sanitizeConsultation(c) {
  if (!c) return null;
  return {
    id: c._id,
    consultationCode: c.consultationCode,
    appointment: c.appointmentId,
    patient: c.patientId,
    doctor: c.doctorId,
    vitals: c.vitalsId,
    chiefComplaints: c.chiefComplaints,
    symptoms: c.symptoms,
    clinicalExamination: c.clinicalExamination,
    diagnoses: c.diagnoses,
    assessment: c.assessment,
    advice: c.advice,
    recommendedTests: c.recommendedTests,
    followUp: c.followUp,
    privateDoctorNotes: c.privateDoctorNotes,
    status: c.status,
    startedAt: c.startedAt,
    completedAt: c.completedAt,
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
    const consultation = await getConsultation(authUser, consultationId);

    // Strip private notes if not authorized (simplified for this phase)
    const sanitized = sanitizeConsultation(consultation);
    if (authUser.role !== "doctor") {
      delete sanitized.privateDoctorNotes;
    }

    return NextResponse.json({ success: true, consultation: sanitized });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const unwrappedParams = await params;
    const { consultationId } = unwrappedParams;
    const body = await request.json().catch(() => ({}));
    
    const validatedData = updateConsultationSchema.parse(body);
    await updateConsultation(authUser, consultationId, validatedData);

    const updated = await getConsultation(authUser, consultationId);

    return NextResponse.json({ 
      success: true, 
      message: "Consultation updated successfully",
      consultation: sanitizeConsultation(updated) 
    });

  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: "Validation failed", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
