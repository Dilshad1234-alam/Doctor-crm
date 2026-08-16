import { NextResponse } from "next/server";
import { connectDB } from "@/backend/database/connectDB";
import DoctorProfile from "@/backend/models/DoctorProfile";
import Appointment from "@/backend/models/Appointment";
// We'll need moment or date-fns. Let's use vanilla JS Date to be safe or check if moment is in package.json.
// Actually, it's safer to use vanilla JS to avoid missing dependency errors.

function timeToMinutes(timeString) {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutesTotal) {
  const hours = Math.floor(minutesTotal / 60);
  const minutes = minutesTotal % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params; // Doctor ID
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // Format: YYYY-MM-DD

    if (!dateParam) {
      return NextResponse.json({ success: false, error: "Date parameter is required" }, { status: 400 });
    }

    const doctor = await DoctorProfile.findOne({ _id: id, isPublic: true, isActive: true }).lean();
    
    if (!doctor) {
      return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 404 });
    }

    // Import the Doctor model locally to avoid circular dependency if any, or just use the imported one.
    const mongoose = require("mongoose");
    const Doctor = mongoose.models.Doctor || mongoose.model("Doctor");
    const doctorUser = await Doctor.findById(doctor.doctorId).select("name").lean();

    if (!doctor.isAvailable) {
      return NextResponse.json({ success: true, data: { slots: [], message: "Doctor is currently unavailable" } });
    }

    const queryDate = new Date(dateParam);
    const dayOfWeek = queryDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Check if doctor works on this day
    if (!doctor.availableDays || !doctor.availableDays.includes(dayOfWeek)) {
      return NextResponse.json({ success: true, data: { slots: [], message: "Doctor is not available on this day" } });
    }

    // Fetch existing appointments for the day
    // Appointment model uses Date for appointmentDate. We need to query for the whole day.
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const existingAppointments = await Appointment.find({
      doctorId: id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ["cancelled"] } // Exclude cancelled appointments
    }).select("startTime endTime status").lean();

    const bookedSlots = existingAppointments.map(app => app.startTime);

    if (doctor.maxPatientsPerDay && existingAppointments.length >= doctor.maxPatientsPerDay) {
      return NextResponse.json({ success: true, data: { slots: [], message: "Maximum patient limit reached for this day" } });
    }

    const slots = [];
    let currentMinutes = timeToMinutes(doctor.startTime);
    const endMinutes = timeToMinutes(doctor.endTime);
    const breakStartMins = timeToMinutes(doctor.breakStart);
    const breakEndMins = timeToMinutes(doctor.breakEnd);
    const duration = doctor.slotDuration || 15;

    while (currentMinutes + duration <= endMinutes) {
      const slotStartTimeStr = minutesToTime(currentMinutes);
      const slotEndTimeStr = minutesToTime(currentMinutes + duration);
      const nextMinutes = currentMinutes + duration;

      let state = "available";

      // Check if slot falls in break time
      if (doctor.breakStart && doctor.breakEnd) {
        if ((currentMinutes >= breakStartMins && currentMinutes < breakEndMins) || 
            (nextMinutes > breakStartMins && nextMinutes <= breakEndMins)) {
          state = "break";
        }
      }

      // Check if slot is booked
      if (state !== "break" && bookedSlots.includes(slotStartTimeStr)) {
        state = "booked";
      }

      // Check if slot is in the past (only for today)
      const now = new Date();
      if (startOfDay.toDateString() === now.toDateString()) {
        const currentNowMinutes = now.getHours() * 60 + now.getMinutes();
        if (currentMinutes < currentNowMinutes) {
          state = "past";
        }
      }

      slots.push({
        startTime: slotStartTimeStr,
        endTime: slotEndTimeStr,
        state: state
      });

      currentMinutes = nextMinutes;
    }

    return NextResponse.json({
      success: true,
      data: {
        slots,
        doctor: {
          fee: doctor.consultationFee,
          maxPatients: doctor.maxPatientsPerDay,
          bookedCount: existingAppointments.length,
          name: doctorUser?.name || "Doctor",
          image: doctor.profileImageUrl || doctor.profileImage || null
        }
      },
    });

  } catch (error) {
    console.error("Error fetching doctor slots:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
