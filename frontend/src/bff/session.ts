import { NextRequest, NextResponse } from "next/server";

/**
 * Utilidades del BFF para manejar la sesión en cookies httpOnly.
 * SOLO SERVIDOR: importar únicamente desde Route Handlers (src/app/api/...), nunca desde componentes.
 *
 * Política:
 * - access_token: JWT de vida corta (JWT_EXPIRATION_MS en el backend). La cookie vive lo mismo que el token,
 *   así el navegador la descarta al expirar y el backend responde 401 → el cliente pide /api/auth/refresh.
 * - refresh_token: token opaco y rotativo validado contra la BD del backend. Su cookie solo se envía a
 *   /api/auth (path restringido) y su expiración real la controla el servidor.
 * Ninguno de los dos es legible desde JavaScript (httpOnly), por lo que no quedan en localStorage.
 */

export const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8080";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

// En producción (HTTPS) debe ser true; en localhost por HTTP el navegador rechazaría la cookie.
const SECURE_COOKIES = process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE === "true";

export interface BackendAuthData {
  token: string;
  refreshToken: string;
  expiresIn: number;
  type: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
}

// Se escribe el encabezado Set-Cookie directamente en lugar de usar response.cookies.set():
// en Next 14.2 esa API además emite "x-middleware-set-cookie" con el valor del token en claro,
// un encabezado legible desde JavaScript que anularía la protección httpOnly.
function serializeCookie(name: string, value: string, path: string, maxAgeSeconds?: number) {
  const parts = [`${name}=${value}`, `Path=${path}`, "HttpOnly", "SameSite=Lax"];
  if (maxAgeSeconds !== undefined) parts.push(`Max-Age=${maxAgeSeconds}`);
  if (SECURE_COOKIES) parts.push("Secure");
  return parts.join("; ");
}

export function setSessionCookies(response: NextResponse, data: BackendAuthData) {
  response.headers.append("Set-Cookie", serializeCookie(ACCESS_COOKIE, data.token, "/", Math.floor(data.expiresIn / 1000)));
  response.headers.append("Set-Cookie", serializeCookie(REFRESH_COOKIE, data.refreshToken, "/api/auth"));
}

export function clearSessionCookies(response: NextResponse) {
  response.headers.append("Set-Cookie", serializeCookie(ACCESS_COOKIE, "", "/", 0));
  response.headers.append("Set-Cookie", serializeCookie(REFRESH_COOKIE, "", "/api/auth", 0));
}

/** Datos públicos de la sesión: todo menos los tokens. */
export function toPublicAuthData(data: BackendAuthData) {
  const { token, refreshToken, ...publicData } = data;
  return publicData;
}

export function getAccessToken(request: NextRequest): string | undefined {
  return request.cookies.get(ACCESS_COOKIE)?.value;
}

export function getRefreshToken(request: NextRequest): string | undefined {
  return request.cookies.get(REFRESH_COOKIE)?.value;
}
