import "server-only";

import { NextResponse } from "next/server";

/** Cookie httpOnly que guarda el refresh token; el JavaScript del navegador nunca lo ve. */
export const REFRESH_COOKIE_NAME = "refresh_token";

/** Solo las rutas /api/auth/* del BFF reciben la cookie. */
const REFRESH_COOKIE_PATH = "/api/auth";

/** Secure solo en producción; REFRESH_COOKIE_SECURE=true|false permite forzarlo. */
function isSecureCookie(): boolean {
  const override = process.env.REFRESH_COOKIE_SECURE;
  if (override) return override === "true";
  return process.env.NODE_ENV === "production";
}

export function setRefreshCookie(res: NextResponse, refreshToken: string, maxAgeSeconds: number): void {
  res.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: refreshToken,
    httpOnly: true,
    sameSite: "strict",
    secure: isSecureCookie(),
    path: REFRESH_COOKIE_PATH,
    maxAge: Math.max(0, Math.floor(maxAgeSeconds)),
  });
}

export function clearRefreshCookie(res: NextResponse): void {
  res.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: isSecureCookie(),
    path: REFRESH_COOKIE_PATH,
    maxAge: 0,
  });
}

/** Headers del backend que se conservan al reconstruir la respuesta JSON. */
function copyResponseHeaders(source: Response): Headers {
  const headers = new Headers(source.headers);
  headers.delete("content-length");
  headers.delete("content-type");
  headers.delete("set-cookie");
  return headers;
}

export function jsonError(status: number, message: string): NextResponse {
  return NextResponse.json(
    { success: false, message, data: null },
    { status, headers: { "X-Proxied-By": "nextjs-bff", "Cache-Control": "no-store" } }
  );
}

/**
 * Toma la respuesta exitosa de /login o /refresh del backend, guarda el refreshToken
 * en la cookie httpOnly y devuelve al navegador el mismo JSON SIN el refreshToken.
 * Si el backend respondió error, la respuesta se devuelve tal cual (sin tocar cookies).
 */
export async function withRefreshCookie(backendRes: Response): Promise<Response> {
  if (!backendRes.ok) {
    return backendRes;
  }

  const payload = await backendRes.json().catch(() => null);
  const data = payload?.data;

  if (!data?.refreshToken) {
    return jsonError(502, "Respuesta de autenticación inválida del backend");
  }

  const { refreshToken, refreshExpiresIn, ...safeData } = data;
  const res = NextResponse.json(
    { ...payload, data: safeData },
    { status: backendRes.status, headers: copyResponseHeaders(backendRes) }
  );
  setRefreshCookie(res, refreshToken, Number(refreshExpiresIn) || 0);
  return res;
}
