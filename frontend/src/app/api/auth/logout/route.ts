import { clearAuthCookies } from "@/lib/server/auth-cookies";
import { fetchBackend, rejectInvalidOrigin } from "@/lib/server/backend-proxy";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  const originRejection = rejectInvalidOrigin(request);
  if (originRejection) {
    return originRejection;
  }

  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (refreshToken) {
    try {
      await fetchBackend("/api/auth/logout", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Las cookies locales deben eliminarse incluso si el backend no está disponible.
    }
  }

  const response = NextResponse.json({ success: true, message: "Sesión cerrada", data: null });
  clearAuthCookies(response, request);
  return response;
}
