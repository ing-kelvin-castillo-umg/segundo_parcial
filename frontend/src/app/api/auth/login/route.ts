import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";
import { withRefreshCookie } from "@/lib/server/auth-cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Login vía BFF: reenvía las credenciales al backend, guarda el refresh token en una
 * cookie httpOnly y responde al navegador solo con el access token y los datos del usuario.
 */
export async function POST(req: NextRequest) {
  const backendRes = await proxyToBackend(req, "/api/auth/login");
  return withRefreshCookie(backendRes);
}
