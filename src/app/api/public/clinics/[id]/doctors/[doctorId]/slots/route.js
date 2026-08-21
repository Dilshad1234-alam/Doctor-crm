import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ClinicProfile from "@/backend/models/ClinicProfile";
import { getDoctorAvailableSlots } from "@/backend/services/appointmentSlotService";
import { connectDB as connectToDatabase } from "@/backend/database/connectDB";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id: clinicId, doctorId } = await params;

    let resolvedClinicId = clinicId;
    if (!mongoose.Types.ObjectId.isValid(clinicId)) {
      // Slug is derived from clinic name, not stored in DB.
      // So we load all public clinics and match by slugified name.
      function slugify(text) {
        if (!text) return "";
        return text.toString().toLowerCase().trim()
          .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
      }

      const ClinicProfile = (await import("@/backend/models/ClinicProfile")).default;
      const allPublic = await ClinicProfile.find({ isPublic: true })
        .populate("clinicId", "name isActive")
        .lean();

      const matched = allPublic.find(p =>
        p.clinicId?.isActive &&
        slugify(p.clinicId.name) === clinicId.toLowerCase()
      );

      if (!matched) {
        // Try direct ClinicProfile.slug as last fallback
        const clinic = await ClinicProfile.findOne({ slug: clinicId });
        if (!clinic) {
          return NextResponse.json({ success: false, message: "Clinic not found" }, { status: 404 });
        }
        resolvedClinicId = clinic._id.toString();
      } else {
        resolvedClinicId = matched.clinicId._id.toString();
      }
    }

    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get("startDate");
    const dateStr = searchParams.get("date"); // single date mode
    
    if (!startDateStr && !dateStr) {
      return NextResponse.json({ success: false, message: "startDate or date is required" }, { status: 400 });
    }

    if (dateStr) {
      const result = await getDoctorAvailableSlots(resolvedClinicId, doctorId, dateStr);
      return NextResponse.json({
        success: true,
        data: {
          doctor: result.doctor, // if needed
          slots: result.slots || []
        }
      });
    }

    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ success: false, message: "Invalid startDate format" }, { status: 400 });
    }

    const next7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const ds = d.toISOString().split("T")[0];
      next7Days.push(ds);
    }

    const slotsByDate = {};
    for (const ds of next7Days) {
      const result = await getDoctorAvailableSlots(resolvedClinicId, doctorId, ds);
      if (result.success) {
        slotsByDate[ds] = result.slots;
      } else {
        slotsByDate[ds] = [];
      }
    }

    return NextResponse.json({
      success: true,
      data: slotsByDate
    });
  } catch (error) {
    console.error("Error fetching public doctor slots:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
