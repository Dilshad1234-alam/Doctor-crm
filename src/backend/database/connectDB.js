import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

const globalForMongoose = globalThis;

if (!globalForMongoose.mongooseCache) {
  globalForMongoose.mongooseCache = {
    connection: null,
    promise: null,
  };
}

export async function connectDB() {
  const cached = globalForMongoose.mongooseCache;

  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => mongooseInstance)
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.connection = await cached.promise;
  
  // Quick fix: Drop stale index from patients collection
  try {
    const db = cached.connection.connection.db;
    const patientsCollection = db.collection("patients");
    await patientsCollection.dropIndex("clinicId_1_patientCode_1");
    console.log("Dropped stale index clinicId_1_patientCode_1");
  } catch (err) {
    // Ignore if index doesn't exist
  }
  
  return cached.connection;
}
