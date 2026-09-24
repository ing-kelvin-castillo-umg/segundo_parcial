import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";
import { REFRESH_COOKIE_NAME, clearRefreshCookie } from "@/lib/server/auth-cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_REASONS = ["INACTIVITY", "MANUAL"] as const;
type LogoutReason = (typeof VALID_REASONS)[number];

/**
 * Logout vía BFF: envía al backend el refresh token de la cookie httpOnly, el motivo y
 * (reenviado por el helper) el header Authorization. SIEMPRE borra la cookie y responde 200,
 * aunque el backend falle: el navegador debe quedar deslogueado de todos modos.
 */
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const body = await req.json().catch(() => null);
  const reason: LogoutReason = VALID_REASONS.includes(body?.reason) ? body.reason : "MANUAL";

  try {
    const backendRes = await proxyToBackend(req, "/api/auth/logout", {
      body: JSON.stringify({ refreshToken, reason }),
      headers: { "content-type": "application/json", accept: "application/json" },
    });

    if (!backendRes.ok) {
      const detail = await backendRes.text().catch(() => "");
      console.error(`[BFF] Logout [${reason}] falló en el backend (${backendRes.status}): ${detail}`);
    }
  } catch (error: any) {
    console.error(`[BFF] Logout [${reason}] no pudo contactar al backend:`, error?.message || error);
  }

  const res = NextResponse.json(
    { success: true, message: "Sesión cerrada", data: { reason } },
    { status: 200, headers: { "X-Proxied-By": "nextjs-bff", "Cache-Control": "no-store" } }
  );
  clearRefreshCookie(res);
  return res;
}
