import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, BackendAuthData, setSessionCookies, toPublicAuthData } from "@/bff/session";

export const dynamic = "force-dynamic";

/**
 * Login vía BFF: autentica contra el backend y guarda access/refresh token en cookies httpOnly.
 * Al navegador solo se le devuelven los datos públicos del usuario (sin tokens).
 */
export async function POST(request: NextRequest) {
  try {
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    const payload = await backendResponse.json();

    if (!backendResponse.ok || !payload?.success) {
      console.log(`[BFF] POST /api/auth/login -> backend ${backendResponse.status} (credenciales rechazadas)`);
      return NextResponse.json(payload, { status: backendResponse.status });
    }

    const data = payload.data as BackendAuthData;
    const response = NextResponse.json({ ...payload, data: toPublicAuthData(data) });
    setSessionCookies(response, data);

    console.log(`[BFF] Login de '${data.username}': tokens guardados en cookies httpOnly (access expira en ${data.expiresIn / 1000}s)`);
    return response;
  } catch (error: any) {
    console.error("[BFF] Error en login:", error.message);
    return NextResponse.json({ success: false, message: "Servicio no disponible. Intente más tarde.", data: null }, { status: 502 });
  }
}
