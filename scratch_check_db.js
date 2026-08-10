import fs from "fs";
import mongoose from "mongoose";

// manually parse .env.local
const envConfig = fs.readFileSync(".env.local", "utf8").split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '').trim();
});

// use dynamic import to ensure process.env is set before they evaluate
async function run() {
  const { connectDB } = await import("./src/backend/database/connectDB.js");
  const QueueEntryModule = await import("./src/backend/models/QueueEntry.js");
  const QueueEntry = QueueEntryModule.default;
  
  const AppointmentModule = await import("./src/backend/models/Appointment.js");
  const Appointment = AppointmentModule.default;
  
  await connectDB();
  const appointments = await Appointment.find().lean();
  console.log("Total appointments:", appointments.length);
  
  if (appointments.length > 0) {
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    today.setHours(0,0,0,0);
    
    const todayAppointments = appointments.filter(a => {
      const aptDate = new Date(a.appointmentDate);
      aptDate.setHours(0,0,0,0);
      return aptDate.getTime() === today.getTime();
    });
    
    console.log("Appointments for today:", todayAppointments.length);
    if (todayAppointments.length > 0) {
      console.log("Sample today apt:", todayAppointments[0].status);
    }
  }
  mongoose.disconnect();
}
run();
