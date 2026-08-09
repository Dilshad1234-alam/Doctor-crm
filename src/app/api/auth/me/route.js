import { NextResponse } from "next/server";
import { getAuthTokenFromCookies } from "@/backend/utils/authCookie";
import { verifyAuthToken } from "@/backend/utils/auth";
import { getCurrentUser as fetchCurrentUser } from "@/backend/services/authService";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const token = await getAuthTokenFromCookies();
    console.log("Token from request:", token ? "Exists" : "Null");
    
    if (!token) {
      return NextResponse.json(
        { success: true, user: null, message: "Not authenticated" },
        { status: 200 }
      );
    }
    
    const decoded = verifyAuthToken(token);
    console.log("Decoded token:", decoded);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: true, user: null, message: "Invalid or expired token" },
        { status: 200 }
      );
    }
    
    const user = await fetchCurrentUser(decoded.userId);
    console.log("Found user:", user ? "Exists" : "Null");
    
    if (!user) {
      return NextResponse.json(
        { success: true, user: null, message: "User not found or inactive" },
        { status: 200 }
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
