import { cookies } from "next/headers";

const COOKIE_NAME = "doctor_crm_token";

export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function getAuthTokenFromRequest(request) {
  // Can be used with Request object in API routes or Middleware
  const cookie = request.cookies.get(COOKIE_NAME);
  return cookie?.value || null;
}

export async function getAuthTokenFromCookies() {
  // Can be used in Server Components or Server Actions
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}
