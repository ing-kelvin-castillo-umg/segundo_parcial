import "server-only";

import { NextRequest, NextResponse } from "next/server";

interface BackendAuthData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
  refreshTokenExpiresInSeconds: number;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
}

interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: BackendAuthData;
}

function isBackendAuthResponse(value: unknown): value is BackendAuthResponse {
  if (typeof value !== "object" || value === null || !("data" in value)) {
    return false;
  }

  const data = value.data;
  return (
    typeof data === "object" &&
    data !== null &&
    "accessToken" in data &&
    typeof data.accessToken === "string" &&
    "refreshToken" in data &&
    typeof data.refreshToken === "string" &&
    "accessTokenExpiresInSeconds" in data &&
    typeof data.accessTokenExpiresInSeconds === "number" &&
    "refreshTokenExpiresInSeconds" in data &&
    typeof data.refreshTokenExpiresInSeconds === "number" &&
    "username" in data &&
    typeof data.username === "string" &&
    "roles" in data &&
    Array.isArray(data.roles)
  );
}

function secureCookies(request: NextRequest): boolean {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const publicHost = forwardedHost || request.headers.get("host") || request.nextUrl.hostname;
  const hostname = publicHost.startsWith("[")
    ? publicHost.slice(1, publicHost.indexOf("]"))
    : publicHost.split(":")[0];

  return !["localhost", "127.0.0.1", "::1"].includes(hostname.toLowerCase());
}

export function setAuthCookies(response: NextResponse, request: NextRequest, data: BackendAuthData): void {
  const secure = secureCookies(request);

  response.cookies.set("access_token", data.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: data.accessTokenExpiresInSeconds,
  });
  response.cookies.set("refresh_token", data.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: data.refreshTokenExpiresInSeconds,
  });
}

export function clearAuthCookies(response: NextResponse, request: NextRequest): void {
  const secure = secureCookies(request);

  response.cookies.set("access_token", "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });
}

export async function createAuthResponse(
  upstreamResponse: Response,
  request: NextRequest,
  includeUser: boolean,
): Promise<NextResponse> {
  const responseText = await upstreamResponse.text();
  let payload: unknown = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText) as unknown;
    } catch {
      payload = null;
    }
  }

  if (!upstreamResponse.ok || !isBackendAuthResponse(payload)) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "No fue posible completar la autenticación";
    const response = NextResponse.json(
      { success: false, message, data: null },
      { status: upstreamResponse.ok ? 502 : upstreamResponse.status },
    );
    clearAuthCookies(response, request);
    return response;
  }

  const browserData = includeUser
    ? {
        username: payload.data.username,
        fullName: payload.data.fullName,
        email: payload.data.email,
        roles: payload.data.roles,
      }
    : null;
  const response = NextResponse.json({
    success: true,
    message: payload.message,
    data: browserData,
  });
  setAuthCookies(response, request, payload.data);
  return response;
}
