import { NextResponse } from "next/server";
import { getDoctorAvailableSlots } from "@/backend/services/appointmentSlotService";
import { connectDB as connectToDatabase } from "@/backend/database/connectDB";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id: clinicId, doctorId } = params;

    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get("startDate"); // YYYY-MM-DD
    
    if (!startDateStr) {
      return NextResponse.json({ success: false, message: "startDate is required" }, { status: 400 });
    }

    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ success: false, message: "Invalid startDate format" }, { status: 400 });
    }

    const next7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      next7Days.push(dateStr);
    }

    const slotsByDate = {};
    for (const dateStr of next7Days) {
      const result = await getDoctorAvailableSlots(clinicId, doctorId, dateStr);
      if (result.success) {
        slotsByDate[dateStr] = result.slots;
      } else {
        slotsByDate[dateStr] = [];
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
