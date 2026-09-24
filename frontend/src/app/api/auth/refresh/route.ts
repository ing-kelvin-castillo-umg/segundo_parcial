import { NextRequest, NextResponse } from "next/server";
import { backendFetch, errorResponse } from "@/lib/backend-proxy";
import { clearRefreshCookie, readRefreshCookie, respondWithSession } from "@/lib/refresh-cookie";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Renovación: toma el refresh token de la cookie httpOnly, lo rota en el backend y guarda el nuevo en la cookie.
export async function POST(request: NextRequest) {
  const refreshToken = readRefreshCookie(request);
  if (!refreshToken) {
    const response = NextResponse.json(
      { success: false, message: "No hay una sesión que renovar", data: null },
      { status: 401 }
    );
    clearRefreshCookie(response, request);
    return response;
  }

  const upstream = await backendFetch("/api/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) });
  if (!upstream) return errorResponse(502, "No fue posible comunicarse con el servicio de backend");

  const response = await respondWithSession(upstream, request);
  // Token vencido, revocado o inválido: la cookie ya no sirve y se elimina.
  if (upstream.status === 401) clearRefreshCookie(response, request);
  return response;
}
