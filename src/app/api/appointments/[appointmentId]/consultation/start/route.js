import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { startConsultation } from "@/backend/services/consultationService";

export async function POST(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const unwrappedParams = await params;
    const { appointmentId } = unwrappedParams;
    
    const consultation = await startConsultation(authUser, appointmentId);

    return NextResponse.json({ 
      success: true, 
      consultation 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
