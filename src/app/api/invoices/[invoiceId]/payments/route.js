import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { recordPayment, getPaymentsForInvoice } from "@/backend/services/billingService";

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { invoiceId } = await params;
    const payments = await getPaymentsForInvoice(authUser, invoiceId);
    
    return NextResponse.json({ success: true, payments });
  } catch (error) {
    console.error(`GET /api/invoices/${params?.invoiceId}/payments Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function POST(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { invoiceId } = await params;
    const body = await request.json();

    const result = await recordPayment(authUser, invoiceId, body);
    
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error(`POST /api/invoices/${params?.invoiceId}/payments Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
