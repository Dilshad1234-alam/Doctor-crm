import { NextResponse } from "next/server";
import { registerSchema } from "@/backend/validations/authValidation";
import { registerClinicOwner } from "@/backend/services/authService";
import { setAuthCookie } from "@/backend/utils/authCookie";
import { ZodError } from "zod";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Process registration
    const { user } = await registerClinicOwner(validatedData);
    
    return NextResponse.json(
      { success: true, message: "Account created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: error.issues?.[0]?.message || error.errors?.[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    
    if (error.message === "Email is already registered") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
