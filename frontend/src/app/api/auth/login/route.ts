import { NextRequest } from "next/server";
import { backendFetch, errorResponse } from "@/lib/backend-proxy";
import { respondWithSession } from "@/lib/refresh-cookie";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Login: el refresh token que devuelve el backend se guarda en una cookie httpOnly y no llega al JS del navegador.
export async function POST(request: NextRequest) {
  const upstream = await backendFetch("/api/auth/login", { method: "POST", body: await request.text() });
  if (!upstream) return errorResponse(502, "No fue posible comunicarse con el servicio de backend");
  return respondWithSession(upstream, request);
}
