import DoctorProfile from "../models/DoctorProfile.js";
import DoctorScheduleException from "../models/DoctorScheduleException.js";
import Appointment from "../models/Appointment.js";
import { ACTIVE_STATUSES } from "../utils/appointmentStatus.js";

import ClinicSettings from "../models/ClinicSettings.js";

const DAYS_OF_WEEK = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function getDayString(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return DAYS_OF_WEEK[date.getDay()];
}

function timeToMins(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function generateTimeSlots(startTime, endTime, durationMinutes) {
  const slots = [];
  let [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentTotalMins = startHour * 60 + startMin;
  const endTotalMins = endHour * 60 + endMin;

  while (currentTotalMins + durationMinutes <= endTotalMins) {
    const h = Math.floor(currentTotalMins / 60);
    const m = currentTotalMins % 60;
    const slotStart = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    const nextMins = currentTotalMins + durationMinutes;
    const nh = Math.floor(nextMins / 60);
    const nm = nextMins % 60;
    const slotEnd = `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;

    slots.push({ startTime: slotStart, endTime: slotEnd });
    currentTotalMins += durationMinutes;
  }

  return slots;
}

export async function getDoctorAvailableSlots(clinicId, doctorId, dateStr) {
  // 1. Fetch Doctor Profile
  const doctor = await DoctorProfile.findOne({ _id: doctorId, clinicId, isActive: true });
  if (!doctor || !doctor.isAcceptingAppointments) {
    return { success: false, slots: [], message: "Doctor is unavailable." };
  }

  // 2. Determine Day of Week
  const dayStr = getDayString(dateStr);
  const legacyAvailability = doctor.availability?.find((a) => a.day === dayStr);

  let isAvailable = false;
  let scheduleSlots = [];

  // Check top-level availability first (Step 2 Implementation)
  if (doctor.isAvailable !== false && doctor.availableDays?.includes(dayStr)) {
    isAvailable = true;
    let mainStartTime = doctor.startTime || "09:00";
    let mainEndTime = doctor.endTime || "17:00";
    
    if (doctor.breakStart && doctor.breakEnd) {
      scheduleSlots = [
        { startTime: mainStartTime, endTime: doctor.breakStart },
        { startTime: doctor.breakEnd, endTime: mainEndTime }
      ];
    } else {
      scheduleSlots = [{ startTime: mainStartTime, endTime: mainEndTime }];
    }
  } else if (legacyAvailability) {
    // Fallback to legacy configuration
    isAvailable = legacyAvailability.isAvailable;
    scheduleSlots = legacyAvailability.slots || [];
  }

  // 3. Apply Schedule Exceptions
  const [tYear, tMonth, tDay] = dateStr.split("-").map(Number);
  const targetDate = new Date(tYear, tMonth - 1, tDay);
  
  // Find exception for this specific date
  const exception = await DoctorScheduleException.findOne({ doctorId, clinicId, date: targetDate });

  if (exception) {
    isAvailable = exception.isAvailable;
    if (exception.type === "custom_hours" && exception.customSlots && exception.customSlots.length > 0) {
      scheduleSlots = exception.customSlots;
    } else if (exception.type === "leave" || exception.type === "holiday" || exception.type === "emergency_unavailable") {
      scheduleSlots = [];
    }
  }

  if (!isAvailable || scheduleSlots.length === 0) {
    return { success: true, slots: [], message: "Doctor has no available hours on this date." };
  }

  // 4. Fetch Clinic Settings to enforce clinic working hours
  const settings = await ClinicSettings.findOne({ clinicId }).lean();
  let clinicWorkingHours = null;
  let clinicDuration = 15;

  if (settings) {
    clinicWorkingHours = settings.workingHours?.find(w => w.day === dayStr);
    if (settings.appointmentSettings?.defaultSlotDuration) {
      clinicDuration = settings.appointmentSettings.defaultSlotDuration;
    }
  }

  // If clinic is closed, no slots
  if (clinicWorkingHours && !clinicWorkingHours.isOpen) {
    return { success: true, slots: [], message: "Clinic is closed on this date." };
  }

  const duration = doctor.slotDuration || doctor.defaultSlotDuration || clinicDuration;
  let allSlots = [];

  for (const block of scheduleSlots) {
    let blockStart = block.startTime;
    let blockEnd = block.endTime;

    // Enforce clinic working hours bounds
    if (clinicWorkingHours && clinicWorkingHours.isOpen) {
      const clinicStartMins = timeToMins(clinicWorkingHours.openingTime);
      const clinicEndMins = timeToMins(clinicWorkingHours.closingTime);
      const blockStartMins = timeToMins(blockStart);
      const blockEndMins = timeToMins(blockEnd);

      const boundedStartMins = Math.max(clinicStartMins, blockStartMins);
      const boundedEndMins = Math.min(clinicEndMins, blockEndMins);

      if (boundedStartMins >= boundedEndMins) continue; // Out of bounds

      const sh = Math.floor(boundedStartMins / 60);
      const sm = boundedStartMins % 60;
      blockStart = `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;

      const eh = Math.floor(boundedEndMins / 60);
      const em = boundedEndMins % 60;
      blockEnd = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
    }

    const generated = generateTimeSlots(blockStart, blockEnd, duration);
    allSlots.push(...generated);
  }

  // 5. Fetch existing appointments
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingAppointments = await Appointment.find({
    clinicId,
    doctorId,
    appointmentDate: { $gte: targetDate, $lte: endOfDay },
    status: { $in: ACTIVE_STATUSES }
  });

  const bookedStartTimes = new Set(existingAppointments.map(a => a.startTime));
  const isMaxReached = doctor.maxPatientsPerDay && existingAppointments.length >= doctor.maxPatientsPerDay;

  // 6. Map slots with isBooked flag
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  let isDateInPast = false;
  let currentTotalMins = 0;

  if (targetDate.getTime() < today.getTime()) {
    isDateInPast = true;
  } else if (targetDate.getTime() === today.getTime()) {
    currentTotalMins = now.getHours() * 60 + now.getMinutes();
  }

  const finalSlots = allSlots.map(slot => {
    const [sh, sm] = slot.startTime.split(":").map(Number);
    const slotMins = sh * 60 + sm;
    
    const isPast = isDateInPast || (targetDate.getTime() === today.getTime() && slotMins <= currentTotalMins);
    const isBooked = isPast || isMaxReached || bookedStartTimes.has(slot.startTime);

    return {
      ...slot,
      isBooked
    };
  });

  return { success: true, slots: finalSlots };
}
