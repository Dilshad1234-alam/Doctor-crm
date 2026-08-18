import mongoose from "mongoose";
import DoctorProfile from "./src/backend/models/DoctorProfile.js";
import Clinic from "./src/backend/models/Clinic.js";
import { getDoctorAvailableSlots } from "./src/backend/services/appointmentSlotService.js";
import { connectDB } from "./src/backend/database/connectDB.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
  await connectDB();
  const slug = "patna-care-multispeciality-clinic";
  const clinic = await Clinic.findOne({ slug });
  console.log("Clinic found:", !!clinic);
  if (!clinic) return;
  
  const doctor = await DoctorProfile.findOne({ clinicId: clinic._id });
  console.log("Doctor found:", !!doctor, doctor?._id);
  
  if (doctor) {
    const res = await getDoctorAvailableSlots(clinic._id.toString(), doctor.doctorId.toString(), "2026-08-17");
    console.log("Result:", JSON.stringify(res, null, 2));
  }
  process.exit(0);
}
run();
