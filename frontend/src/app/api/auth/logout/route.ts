import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-proxy";
import { clearRefreshCookie, readRefreshCookie } from "@/lib/refresh-cookie";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Logout: revoca la sesión en el backend usando el refresh token de la cookie (no requiere access token vigente).
export async function POST(request: NextRequest) {
  const refreshToken = readRefreshCookie(request);
  if (refreshToken) {
    // Motivo opcional enviado por el frontend (p. ej. INACTIVITY); cualquier otro valor se ignora.
    const body = await request.json().catch(() => null);
    const reason = body?.reason === "INACTIVITY" ? "INACTIVITY" : undefined;
    await backendFetch("/api/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken, reason }) });
  }
  const response = NextResponse.json({ success: true, message: "Sesión cerrada exitosamente", data: null });
  clearRefreshCookie(response, request);
  return response;
}
