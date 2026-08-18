import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://dilshad:7A9idnbbbqpca7w0@cluster0.0e7evlz.mongodb.net/doctor";

async function fixIndexes() {
  if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const collection = db.collection("patientprofiles");

    // List indexes
    const indexes = await collection.indexes();
    console.log("Current indexes on patientprofiles:", indexes.map((i) => i.name));

    // Drop userId_1 if exists
    const hasUserId = indexes.some((i) => i.name === "userId_1");
    if (hasUserId) {
      console.log("Dropping userId_1 index...");
      await collection.dropIndex("userId_1");
      console.log("userId_1 index dropped successfully.");
    } else {
      console.log("userId_1 index not found. No action needed.");
    }

    // Ensure patientId_1 exists and is unique
    console.log("Ensuring patientId_1 unique index...");
    await collection.createIndex({ patientId: 1 }, { unique: true });
    console.log("patientId_1 index ensured.");

    // Final list of indexes
    const finalIndexes = await collection.indexes();
    console.log("Final indexes on patientprofiles:", finalIndexes.map((i) => i.name));
  } catch (error) {
    console.error("Error fixing indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

fixIndexes();
