import { NextRequest, NextResponse } from "next/server";
import {
  BACKEND_URL,
  BackendAuthData,
  clearSessionCookies,
  getRefreshToken,
  setSessionCookies,
  toPublicAuthData,
} from "@/bff/session";

export const dynamic = "force-dynamic";

/**
 * Renovación de sesión vía BFF: toma el refresh token de su cookie httpOnly, lo valida/rota en el backend
 * y reemplaza ambas cookies con el nuevo par de tokens. Si el backend lo rechaza, se limpia la sesión.
 */
export async function POST(request: NextRequest) {
  const refreshToken = getRefreshToken(request);

  if (!refreshToken) {
    console.log("[BFF] Refresh rechazado: no hay cookie refresh_token");
    const response = NextResponse.json({ success: false, message: "Sesión expirada", data: null }, { status: 401 });
    clearSessionCookies(response);
    return response;
  }

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    const payload = await backendResponse.json();

    if (!backendResponse.ok || !payload?.success) {
      console.log(`[BFF] Refresh rechazado por el backend (${backendResponse.status}): ${payload?.message}`);
      const response = NextResponse.json(payload, { status: 401 });
      clearSessionCookies(response);
      return response;
    }

    const data = payload.data as BackendAuthData;
    const response = NextResponse.json({ ...payload, data: toPublicAuthData(data) });
    setSessionCookies(response, data);

    console.log(`[BFF] Token renovado para '${data.username}': nuevo access token (${data.expiresIn / 1000}s) y refresh token rotado`);
    return response;
  } catch (error: any) {
    console.error("[BFF] Error en refresh:", error.message);
    return NextResponse.json({ success: false, message: "Servicio no disponible. Intente más tarde.", data: null }, { status: 502 });
  }
}
