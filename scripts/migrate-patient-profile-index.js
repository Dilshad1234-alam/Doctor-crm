import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function runMigration() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");
    
    const db = mongoose.connection.db;
    const collection = db.collection("patientprofiles");
    
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes.map(i => i.name));
    
    if (indexes.some(i => i.name === "userId_1")) {
      console.log("Dropping userId_1 index...");
      await collection.dropIndex("userId_1");
      console.log("Successfully dropped userId_1 index.");
    } else {
      console.log("userId_1 index not found. Maybe already dropped.");
    }

    if (!indexes.some(i => i.name === "patientId_1")) {
      console.log("patientId_1 index not found. You can let Mongoose create it automatically on next start or create it here.");
    }
    
    console.log("Migration complete.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runMigration();
