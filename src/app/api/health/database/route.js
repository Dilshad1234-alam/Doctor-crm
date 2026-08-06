import { NextResponse } from "next/server";
import { connectDB } from "@/backend/database/connectDB";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json(
      {
        success: true,
        message: "MongoDB connected successfully",
        database: "connected",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database connection error in health check:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "MongoDB connection failed",
        database: "disconnected",
      },
      { status: 500 }
    );
  }
}
