import { NextResponse } from "next/server";
import { connectDB } from "@/backend/database/connectDB";

export const runtime = "nodejs";

export async function GET() {
  try {
    const conn = await connectDB();
    const db = conn.connection.db;
    const patientsCollection = db.collection("patients");
    await patientsCollection.dropIndex("clinicId_1_patientCode_1");
    return NextResponse.json({ success: true, message: "Index dropped" });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
