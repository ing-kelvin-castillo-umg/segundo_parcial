import { clearAuthCookies, createAuthResponse } from "@/lib/server/auth-cookies";
import { fetchBackend, rejectInvalidOrigin } from "@/lib/server/backend-proxy";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  const originRejection = rejectInvalidOrigin(request);
  if (originRejection) {
    return originRejection;
  }

  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    const response = NextResponse.json(
      { success: false, message: "No existe una sesión renovable", data: null },
      { status: 401 },
    );
    clearAuthCookies(response, request);
    return response;
  }

  try {
    const upstreamResponse = await fetchBackend("/api/auth/refresh", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    return createAuthResponse(upstreamResponse, request, false);
  } catch {
    const response = NextResponse.json(
      { success: false, message: "No fue posible renovar la sesión", data: null },
      { status: 502 },
    );
    clearAuthCookies(response, request);
    return response;
  }
}
