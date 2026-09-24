import { clearAuthCookies, createAuthResponse } from "@/lib/server/auth-cookies";
import { fetchBackend, rejectInvalidOrigin } from "@/lib/server/backend-proxy";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  const originRejection = rejectInvalidOrigin(request);
  if (originRejection) {
    return originRejection;
  }

  try {
    const upstreamResponse = await fetchBackend("/api/auth/login", {
      method: "POST",
      headers: { "content-type": request.headers.get("content-type") || "application/json" },
      body: await request.arrayBuffer(),
    });
    return createAuthResponse(upstreamResponse, request, true);
  } catch {
    const response = NextResponse.json(
      { success: false, message: "No fue posible comunicarse con el servicio de autenticación", data: null },
      { status: 502 },
    );
    clearAuthCookies(response, request);
    return response;
  }
}
