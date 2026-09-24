import { NextRequest, NextResponse } from "next/server";
import { callBackend } from "@/lib/backend";
import { setRefreshCookie } from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 *
 * Autentica contra el backend interno y separa las credenciales: el access token
 * viaja al navegador en el cuerpo de la respuesta, mientras que el refresh token
 * se retiene aquí y se guarda en una cookie httpOnly inaccesible desde el cliente.
 */
export async function POST(request: NextRequest) {
  const credentials = await request.json().catch(() => null);

  if (!credentials) {
    return NextResponse.json(
      { success: false, message: "Solicitud inválida", data: null },
      { status: 400 }
    );
  }

  const { status, payload } = await callBackend("/api/auth/login", {
    method: "POST",
    body: credentials,
  });

  if (status !== 200 || !payload?.data?.refreshToken) {
    return NextResponse.json(payload ?? { success: false, message: "Error de autenticación", data: null }, { status });
  }

  const { refreshToken, ...publicData } = payload.data;

  const response = NextResponse.json({ ...payload, data: publicData }, { status });
  setRefreshCookie(response, refreshToken);
  return response;
}
