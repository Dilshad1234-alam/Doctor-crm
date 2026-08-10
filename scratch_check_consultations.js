import { connectDB } from "./src/backend/database/connectDB.js";
import Consultation from "./src/backend/models/Consultation.js";
import mongoose from "mongoose";

async function check() {
  await connectDB();
  const consultations = await Consultation.find().lean();
  console.log("Total consultations:", consultations.length);
  console.log(JSON.stringify(consultations, null, 2));
  mongoose.disconnect();
}
check();
