const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^#\s][^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/(^"|"$)/g, "");
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

async function dropOldIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const patientsCollection = db.collection("patients");

    const indexes = await patientsCollection.indexes();
    console.log("Existing indexes on patients:", indexes.map(i => i.name));

    try {
      await patientsCollection.dropIndex("clinicId_1_patientCode_1");
      console.log("Successfully dropped clinicId_1_patientCode_1 index from patients collection.");
    } catch (e) {
      console.log("Could not drop index:", e.message);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

dropOldIndexes();
