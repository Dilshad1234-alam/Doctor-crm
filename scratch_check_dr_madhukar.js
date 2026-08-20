import mongoose from "mongoose";
import { connectDB } from "./src/backend/database/connectDB.js";
import DoctorProfile from "./src/backend/models/DoctorProfile.js";
import User from "./src/backend/models/User.js";

async function run() {
  await connectDB();
  const user = await User.findOne({ name: /Madhukar Dayal/i });
  if (!user) {
    console.log("Doctor user not found");
    process.exit(0);
  }
  const profile = await DoctorProfile.findOne({ doctorId: user._id });
  if (!profile) {
    console.log("Profile not found");
    process.exit(0);
  }
  console.log("Availability:", JSON.stringify(profile.availability, null, 2));
  console.log("AvailableDays:", profile.availableDays);
  process.exit(0);
}

run();
