import { NextResponse } from "next/server";
import { getAuthTokenFromCookies, setAuthCookie } from "@/backend/utils/authCookie";
import { verifyAuthToken } from "@/backend/utils/auth";
import { clinicSetupSchema } from "@/backend/validations/authValidation";
import { setupClinicForOwner } from "@/backend/services/clinicService";
import { ZodError } from "zod";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const token = await getAuthTokenFromCookies();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const decoded = verifyAuthToken(token);
    
    if (!decoded || !decoded.accountId || decoded.accountType !== "clinic") {
      return NextResponse.json(
        { success: false, message: "Invalid token or wrong account type" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const validatedData = clinicSetupSchema.parse(body);
    
    const { clinic, user, token: newToken } = await setupClinicForOwner(decoded.accountId, validatedData);
    
    // Set the new token containing the clinicId
    await setAuthCookie(newToken);
    
    return NextResponse.json(
      { success: true, message: "Clinic created successfully", clinic, user },
      { status: 201 }
    );
  } catch (error) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: error.issues?.[0]?.message || error.errors?.[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    
    if (error.message === "Unauthorized: Insufficient permissions" || error.message === "User not found or inactive") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      );
    }

    if (error.message === "A clinic is already registered for this owner") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    
    console.error("Clinic setup error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
