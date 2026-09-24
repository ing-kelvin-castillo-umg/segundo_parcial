import { NextRequest, NextResponse } from "next/server";
import { callBackend } from "@/lib/backend";
import { REFRESH_COOKIE, clearRefreshCookie } from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/logout
 *
 * Notifica al backend para que invalide las credenciales de la sesión y borra la
 * cookie httpOnly. El cierre se considera exitoso aunque el backend falle: la
 * sesión del navegador debe quedar limpia en cualquier caso.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value ?? null;
  const body = await request.json().catch(() => ({}));
  const reason = typeof body?.reason === "string" ? body.reason : "manual";

  let backendStatus = 0;

  try {
    const result = await callBackend("/api/auth/logout", {
      method: "POST",
      body: { refreshToken, reason },
      authorization: request.headers.get("authorization"),
    });
    backendStatus = result.status;
  } catch (error) {
    console.error("[BFF] El backend no confirmó el cierre de sesión:", (error as Error).message);
  }

  const response = NextResponse.json(
    {
      success: true,
      message: "Sesión cerrada",
      data: { reason, backendNotified: backendStatus === 200 },
    },
    { status: 200 }
  );

  clearRefreshCookie(response);
  return response;
}
