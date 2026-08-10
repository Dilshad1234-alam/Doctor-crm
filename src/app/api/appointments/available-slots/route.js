import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getDoctorAvailableSlots } from "@/backend/services/appointmentSlotService";
import { availableSlotsQuerySchema } from "@/backend/validations/appointmentValidation";
import { connectDB as connectToDatabase } from "@/backend/database/connectDB";

export async function GET(request) {
  try {
    await connectToDatabase();
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsedQuery = availableSlotsQuerySchema.safeParse(searchParams);
    
    if (!parsedQuery.success) {
      return NextResponse.json({ success: false, errors: parsedQuery.error.format() }, { status: 400 });
    }

    const { doctorId, date } = parsedQuery.data;

    const result = await getDoctorAvailableSlots(authUser.clinicId, doctorId, date);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
