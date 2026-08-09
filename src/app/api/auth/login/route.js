import { NextResponse } from "next/server";
import { loginSchema } from "@/backend/validations/authValidation";
import { loginUser } from "@/backend/services/authService";
import { setAuthCookie } from "@/backend/utils/authCookie";
import { ZodError } from "zod";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    
    const validatedData = loginSchema.parse(body);
    
    const { user, token } = await loginUser(validatedData);
    
    await setAuthCookie(token);
    
    return NextResponse.json(
      { success: true, message: "Logged in successfully", user },
      { status: 200 }
    );
  } catch (error) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: error.issues?.[0]?.message || error.errors?.[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    
    if (error.message === "Invalid email or password" || error.message.includes("deactivated")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }
    
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
