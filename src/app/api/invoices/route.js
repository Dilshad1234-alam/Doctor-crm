import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getInvoices } from "@/backend/services/billingService";

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = {};

    if (searchParams.has("status")) query.status = searchParams.get("status");
    if (searchParams.has("search")) query.search = searchParams.get("search");
    if (searchParams.has("dateFrom")) query.dateFrom = searchParams.get("dateFrom");
    if (searchParams.has("dateTo")) query.dateTo = searchParams.get("dateTo");

    const result = await getInvoices(authUser, query);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("GET /api/invoices Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
