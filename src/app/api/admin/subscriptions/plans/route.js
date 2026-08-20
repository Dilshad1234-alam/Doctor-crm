import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import SubscriptionPlan from "@/backend/models/SubscriptionPlan";

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const plans = await SubscriptionPlan.find({}).sort({ price: 1 }).lean();

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error("Fetch plans error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, billingCycle, features, limits } = body;

    await connectDB();

    const plan = new SubscriptionPlan({
      name,
      description,
      price,
      billingCycle,
      features,
      limits,
    });

    await plan.save();

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
