import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { createPatientSchema, patientListQuerySchema } from "@/backend/validations/patientValidation";
import { createPatientForClinic, getPatientsForClinic } from "@/backend/services/patientService";

import { hasPermission } from "@/backend/utils/permissions";

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || !hasPermission(authUser, "patients.view")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const parsedQuery = patientListQuerySchema.parse(queryParams);
    const data = await getPatientsForClinic(authUser, parsedQuery);

    return NextResponse.json({ success: true, ...data }, { status: 200 });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || !hasPermission(authUser, "patients.create")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createPatientSchema.parse(body);
    
    const patient = await createPatientForClinic(authUser, validatedData);
    
    return NextResponse.json({ success: true, patient }, { status: 201 });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.errors }, { status: 400 });
    }
    if (error.code === "PATIENT_DUPLICATE") {
      return NextResponse.json({ success: false, code: error.code, message: error.message, existingPatient: error.existingPatient }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
