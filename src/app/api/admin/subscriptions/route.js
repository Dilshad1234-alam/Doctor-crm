import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import ClinicSubscription from "@/backend/models/ClinicSubscription";
import ClinicProfile from "@/backend/models/ClinicProfile"; // Ensure registered
import SubscriptionPlan from "@/backend/models/SubscriptionPlan"; // Ensure registered

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    // Fetch all active subscriptions, populate clinic and plan details
    const subscriptions = await ClinicSubscription.find({})
      .populate("clinicId", "name email phone")
      .populate("planId", "name price billingCycle")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, subscriptions });
  } catch (error) {
    console.error("Fetch subscriptions error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
