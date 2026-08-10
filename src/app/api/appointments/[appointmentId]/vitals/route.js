import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { recordVitals, updateVitals, getAppointmentVitals } from "@/backend/services/vitalsService";
import { createVitalsSchema, updateVitalsSchema } from "@/backend/validations/vitalsValidation";

function sanitizeVitals(vitals) {
  if (!vitals) return null;
  return {
    id: vitals._id,
    appointmentId: vitals.appointmentId,
    patientId: vitals.patientId,
    doctorId: vitals.doctorId,
    heightCm: vitals.heightCm,
    weightKg: vitals.weightKg,
    temperatureC: vitals.temperatureC,
    bloodPressure: vitals.bloodPressure,
    pulseRate: vitals.pulseRate,
    oxygenSaturation: vitals.oxygenSaturation,
    respiratoryRate: vitals.respiratoryRate,
    bloodSugar: vitals.bloodSugar,
    bmi: vitals.bmi,
    notes: vitals.notes,
    recordedAt: vitals.recordedAt,
    recordedBy: vitals.recordedByUserId ? {
      id: vitals.recordedByUserId._id,
      name: vitals.recordedByUserId.name,
      role: vitals.recordedByUserId.role,
    } : null
  };
}

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { appointmentId } = await params;
    const vitals = await getAppointmentVitals(authUser, appointmentId);

    return NextResponse.json({ success: true, vitals: sanitizeVitals(vitals) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function POST(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { appointmentId } = await params;
    const body = await request.json().catch(() => ({}));
    const validatedData = createVitalsSchema.parse(body);

    const vitals = await recordVitals(authUser, appointmentId, validatedData);
    
    // fetch populated vitals
    const populated = await getAppointmentVitals(authUser, appointmentId);

    return NextResponse.json({ success: true, message: "Vitals recorded successfully", vitals: sanitizeVitals(populated) }, { status: 201 });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: "Validation failed", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { appointmentId } = await params;
    const body = await request.json().catch(() => ({}));
    const validatedData = updateVitalsSchema.parse(body);

    const vitals = await updateVitals(authUser, appointmentId, validatedData);

    return NextResponse.json({ success: true, message: "Vitals updated successfully", vitals: sanitizeVitals(vitals) });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: "Validation failed", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
