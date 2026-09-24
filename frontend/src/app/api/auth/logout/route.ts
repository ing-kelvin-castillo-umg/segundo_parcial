import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, clearSessionCookies, getRefreshToken } from "@/bff/session";

export const dynamic = "force-dynamic";

/**
 * Cierre de sesión vía BFF: notifica al backend para que revoque el refresh token en la BD
 * (la sesión no puede renovarse más) y elimina las cookies httpOnly de la sesión.
 * Las cookies se limpian aunque el backend no responda.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const reason = body?.reason === "inactivity" ? "inactivity" : "manual";
  const refreshToken = getRefreshToken(request);

  let backendStatus: number | string = "sin refresh token";
  if (refreshToken) {
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken, reason }),
        cache: "no-store",
      });
      backendStatus = backendResponse.status;
    } catch (error: any) {
      backendStatus = `error: ${error.message}`;
    }
  }

  console.log(`[BFF] Logout (motivo: ${reason}) → backend /api/auth/logout ${backendStatus}; cookies de sesión eliminadas`);

  const response = NextResponse.json({
    success: true,
    message: reason === "inactivity" ? "Sesión cerrada por inactividad" : "Sesión cerrada",
    data: null,
  });
  clearSessionCookies(response);
  return response;
}
