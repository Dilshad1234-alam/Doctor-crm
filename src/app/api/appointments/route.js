import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { createAppointmentForClinic, getAppointments } from "@/backend/services/appointmentService";
import { createAppointmentSchema, appointmentListQuerySchema } from "@/backend/validations/appointmentValidation";
import { canCreateAppointment } from "@/backend/utils/permissions";
import { connectDB as connectToDatabase } from "@/backend/database/connectDB";

export async function POST(request) {
  try {
    await connectToDatabase();
    const authUser = await getAuthenticatedUser();
    if (!authUser || !canCreateAppointment(authUser)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = createAppointmentSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ success: false, errors: parsedData.error.format() }, { status: 400 });
    }

    const appointment = await createAppointmentForClinic(authUser, parsedData.data);
    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message, code: error.code }, { status: error.status || 500 });
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsedQuery = appointmentListQuerySchema.safeParse(searchParams);
    
    if (!parsedQuery.success) {
      return NextResponse.json({ success: false, errors: parsedQuery.error.format() }, { status: 400 });
    }

    const result = await getAppointments(authUser, parsedQuery.data);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
