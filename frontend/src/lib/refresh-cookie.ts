import { NextRequest, NextResponse } from "next/server";

/**
 * El refresh token viaja al navegador únicamente como cookie httpOnly administrada por el BFF:
 * el JavaScript de la página nunca puede leerlo (mitiga el robo por XSS).
 */
export const REFRESH_COOKIE = "refresh_token";

// Solo se envía a las rutas de autenticación, no al resto de la API.
const COOKIE_PATH = "/api/auth";

/** Secure solo cuando la conexión es HTTPS (en http://localhost el navegador la descartaría). */
function isSecureRequest(request: NextRequest): boolean {
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return proto === "https";
}

export function setRefreshCookie(response: NextResponse, request: NextRequest, token: string, maxAgeSeconds: number) {
  response.cookies.set({
    name: REFRESH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "strict",
    secure: isSecureRequest(request),
    path: COOKIE_PATH,
    maxAge: Math.max(1, Math.floor(maxAgeSeconds)),
  });
}

export function clearRefreshCookie(response: NextResponse, request: NextRequest) {
  response.cookies.set({
    name: REFRESH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: isSecureRequest(request),
    path: COOKIE_PATH,
    maxAge: 0,
  });
}

export function readRefreshCookie(request: NextRequest): string | undefined {
  return request.cookies.get(REFRESH_COOKIE)?.value || undefined;
}

/**
 * Parsea la respuesta del backend (login/refresh). Si fue exitosa y trae refreshToken,
 * lo mueve a la cookie httpOnly y lo elimina del JSON que recibe el navegador.
 */
export async function respondWithSession(upstream: Response, request: NextRequest): Promise<NextResponse> {
  const text = await upstream.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    // respuesta no JSON: se reenvía tal cual
  }

  if (upstream.ok && json?.data?.refreshToken) {
    const { refreshToken, ...publicData } = json.data;
    const response = NextResponse.json({ ...json, data: publicData }, { status: upstream.status });
    setRefreshCookie(response, request, refreshToken, json.data.refreshExpiresIn ?? 0);
    return response;
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
