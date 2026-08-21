import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import ClinicProfile from "@/backend/models/ClinicProfile";

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["pending", "active", "suspended", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    await connectDB();

    const clinic = await ClinicProfile.findById(id);
    if (!clinic) {
      return NextResponse.json({ success: false, message: "Clinic not found" }, { status: 404 });
    }

    const oldStatus = clinic.status;
    clinic.status = status;
    // Keep isActive aligned with standard "active" logic for platform access if needed
    // or just let it remain true unless they shouldn't even log in.
    if (status === "suspended" || status === "rejected") {
      clinic.isActive = false;
    } else if (status === "active") {
      clinic.isActive = true;
    }
    
    await clinic.save();

    // Ideally, create an AuditLog here if the model exists. 
    try {
      const { default: AuditLog } = await import("@/backend/models/AuditLog");
      await AuditLog.create({
        userId: user.id,
        role: "admin",
        action: `Clinic ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        resource: "Clinic",
        resourceId: clinic._id,
        details: { oldStatus, newStatus: status }
      });
    } catch (e) {
      console.log("Audit log might not exist or failed to save:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Clinic status updated to ${status}`,
      clinic
    });
  } catch (error) {
    console.error("Admin clinic status error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
