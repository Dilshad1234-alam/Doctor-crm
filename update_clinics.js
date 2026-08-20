import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./src/backend/database/connectDB.js";
import ClinicProfile from "./src/backend/models/ClinicProfile.js";

async function run() {
  try {
    await connectDB();
    const result = await ClinicProfile.updateMany({}, { $set: { isPublic: true } });
    console.log("Updated clinics:", result);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
