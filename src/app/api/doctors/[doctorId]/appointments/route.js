import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getAppointments } from "@/backend/services/appointmentService";
import { appointmentListQuerySchema } from "@/backend/validations/appointmentValidation";
import { connectDB as connectToDatabase } from "@/backend/database/connectDB";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const unwrappedParams = await params;
    
    if (authUser.role === "doctor" && authUser.doctorId !== unwrappedParams.doctorId) {
      return NextResponse.json({ success: false, message: "Unauthorized access to doctor schedule" }, { status: 403 });
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    searchParams.doctorId = unwrappedParams.doctorId;

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
