import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { updatePatientSchema } from "@/backend/validations/patientValidation";
import { getPatientDetails, updatePatientForClinic } from "@/backend/services/patientService";

export async function GET(request, { params }) {
  try {
    const { patientId } = await params;
    const authUser = await getAuthenticatedUser(request);
    
    if (!authUser || !["clinic_owner", "doctor", "receptionist", "assistant"].includes(authUser.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const patient = await getPatientDetails(authUser, patientId);
    return NextResponse.json({ success: true, patient }, { status: 200 });
  } catch (error) {
    if (error.status === 404) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { patientId } = await params;
    const authUser = await getAuthenticatedUser(request);
    
    if (!authUser || !["clinic_owner", "doctor", "receptionist", "assistant"].includes(authUser.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updatePatientSchema.parse(body);
    
    const patient = await updatePatientForClinic(authUser, patientId, validatedData);
    
    return NextResponse.json({ success: true, patient }, { status: 200 });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.errors }, { status: 400 });
    }
    if (error.status === 404) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    if (error.code === "PATIENT_DUPLICATE") {
      return NextResponse.json({ success: false, code: error.code, message: error.message, existingPatient: error.existingPatient }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
