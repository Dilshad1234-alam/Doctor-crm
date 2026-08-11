import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getInvoice } from "@/backend/services/billingService";

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { invoiceId } = await params;
    const invoice = await getInvoice(authUser, invoiceId);
    
    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error(`GET /api/invoices/${params?.invoiceId} Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
