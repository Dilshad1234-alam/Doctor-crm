import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getPatientVitalsHistory } from "@/backend/services/vitalsService";

function sanitizeVitals(vitalsList) {
  return vitalsList.map(vitals => ({
    id: vitals._id,
    appointmentId: vitals.appointmentId,
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
      name: vitals.recordedByUserId.name,
      role: vitals.recordedByUserId.role,
    } : null
  }));
}

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { patientId } = await params;
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Basic pagination parameters parsing
    if (query.page) query.page = parseInt(query.page) || 1;
    if (query.limit) query.limit = parseInt(query.limit) || 10;

    const result = await getPatientVitalsHistory(authUser, patientId, query);

    return NextResponse.json({ 
      success: true, 
      vitals: sanitizeVitals(result.vitals),
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
