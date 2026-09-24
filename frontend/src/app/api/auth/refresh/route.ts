import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";
import {
  REFRESH_COOKIE_NAME,
  clearRefreshCookie,
  jsonError,
  withRefreshCookie,
} from "@/lib/server/auth-cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Refresh vía BFF: toma el refresh token de la cookie httpOnly, lo intercambia en el backend
 * (que lo rota) y guarda el nuevo refresh token en la cookie. Al navegador solo llega el
 * nuevo access token. Si el backend lo rechaza, se borra la cookie y se responde 401.
 */
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    const res = jsonError(401, "No hay una sesión activa para renovar. Inicia sesión nuevamente.");
    clearRefreshCookie(res);
    return res;
  }

  const backendRes = await proxyToBackend(req, "/api/auth/refresh", {
    body: JSON.stringify({ refreshToken }),
    headers: { "content-type": "application/json", accept: "application/json" },
  });

  // Backend caído: se conserva la cookie para poder reintentar cuando vuelva.
  if (backendRes.status === 502) {
    return backendRes;
  }

  if (!backendRes.ok) {
    const payload = await backendRes.json().catch(() => null);
    const res = jsonError(401, payload?.message || "No se pudo renovar la sesión. Inicia sesión nuevamente.");
    clearRefreshCookie(res);
    return res;
  }

  return withRefreshCookie(backendRes);
}
