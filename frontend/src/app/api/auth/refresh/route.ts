import { NextRequest, NextResponse } from "next/server";
import { callBackend } from "@/lib/backend";
import { REFRESH_COOKIE, clearRefreshCookie, setRefreshCookie } from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/refresh
 *
 * El navegador invoca esta ruta sin enviar credencial alguna: el refresh token se
 * toma de la cookie httpOnly. Si el backend lo acepta, devuelve un access token
 * nuevo y rota el refresh token, que vuelve a quedar guardado en la cookie.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    const response = NextResponse.json(
      { success: false, message: "No existe una sesión que renovar", data: null },
      { status: 401 }
    );
    clearRefreshCookie(response);
    return response;
  }

  const { status, payload } = await callBackend("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });

  // Refresh token vencido o revocado: se limpia la cookie y el cliente deberá
  // volver a la pantalla de inicio de sesión.
  if (status !== 200 || !payload?.data?.token) {
    const response = NextResponse.json(
      payload ?? { success: false, message: "No fue posible renovar la sesión", data: null },
      { status: status === 200 ? 401 : status }
    );
    clearRefreshCookie(response);
    return response;
  }

  const { refreshToken: rotatedRefreshToken, ...publicData } = payload.data;

  const response = NextResponse.json({ ...payload, data: publicData }, { status: 200 });
  if (rotatedRefreshToken) {
    setRefreshCookie(response, rotatedRefreshToken);
  }
  return response;
}
