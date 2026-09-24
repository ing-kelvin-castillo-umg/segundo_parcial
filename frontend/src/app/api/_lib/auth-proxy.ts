import { NextRequest, NextResponse } from "next/server";
import { backendResponseToNextResponse, requestBackend } from "@/app/api/_lib/backend-proxy";

export const REFRESH_COOKIE_NAME = "refresh_token";

type ApiEnvelope = Record<string, unknown> & { data?: Record<string, unknown> };

function isApiEnvelope(value: unknown): value is ApiEnvelope {
  return typeof value === "object" && value !== null;
}

function clearRefreshCookie(response: NextResponse) {
  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

function addRefreshCookie(response: NextResponse, refreshToken: string, expiresAt?: string) {
  const expiration = expiresAt ? new Date(expiresAt) : undefined;
  const maxAge = expiration && !Number.isNaN(expiration.getTime())
    ? Math.max(1, Math.floor((expiration.getTime() - Date.now()) / 1000))
    : undefined;

  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: refreshToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(maxAge ? { maxAge } : {}),
  });
}

async function loginResponseFromBackend(backendResponse: Response): Promise<NextResponse> {
  const responseText = await backendResponse.text();

  try {
    const payload = JSON.parse(responseText) as unknown;
    if (!isApiEnvelope(payload) || !payload.data) throw new Error("Unexpected login response");

    const { refreshToken, refreshTokenExpiresAt, ...publicData } = payload.data;
    const response = NextResponse.json(
      { ...payload, data: publicData },
      { status: backendResponse.status, statusText: backendResponse.statusText },
    );

    if (backendResponse.ok && typeof refreshToken === "string" && refreshToken) {
      addRefreshCookie(
        response,
        refreshToken,
        typeof refreshTokenExpiresAt === "string" ? refreshTokenExpiresAt : undefined,
      );
    }
    return response;
  } catch {
    return new NextResponse(responseText || null, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: { "content-type": backendResponse.headers.get("content-type") || "application/json" },
    });
  }
}

export async function proxyLogin(request: NextRequest): Promise<NextResponse> {
  try {
    return loginResponseFromBackend(await requestBackend(request, "/api/auth/login"));
  } catch {
    return NextResponse.json(
      { success: false, message: "No fue posible comunicarse con el servicio interno.", data: null },
      { status: 502 },
    );
  }
}

export async function proxyRefresh(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    const response = NextResponse.json(
      { success: false, message: "Refresh token no disponible.", data: null },
      { status: 401 },
    );
    clearRefreshCookie(response);
    return response;
  }

  try {
    const backendResponse = await requestBackend(
      request,
      "/api/auth/refresh",
      JSON.stringify({ refreshToken }),
    );
    const response = await backendResponseToNextResponse(backendResponse);
    if (backendResponse.status === 401) clearRefreshCookie(response);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "No fue posible comunicarse con el servicio interno.", data: null },
      { status: 502 },
    );
  }
}
