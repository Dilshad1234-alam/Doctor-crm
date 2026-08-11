import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { createNewInvoice } from "@/backend/services/billingService";

export async function POST(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;
    const body = await request.json();

    const invoice = await createNewInvoice(authUser, appointmentId, body);
    
    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error(`POST /api/appointments/${params?.appointmentId}/invoice Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
