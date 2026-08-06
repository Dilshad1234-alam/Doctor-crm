import { NextResponse } from "next/server";
import { getAuthTokenFromRequest } from "@/backend/utils/authCookie";
import { verifyAuthToken } from "@/backend/utils/auth";
import { getCurrentUser } from "@/backend/services/authService";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const token = getAuthTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const decoded = verifyAuthToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    const user = await getCurrentUser(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found or inactive" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
