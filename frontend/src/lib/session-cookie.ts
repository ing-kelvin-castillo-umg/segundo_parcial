import { NextResponse } from "next/server";

/**
 * El refresh token viaja únicamente en una cookie httpOnly emitida por el propio
 * servidor de Next.js. De esta forma el JavaScript del navegador nunca puede
 * leerlo y queda fuera del alcance de un ataque XSS.
 */
export const REFRESH_COOKIE = "refresh_token";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 horas, igual que el backend

// El entorno de evaluación se sirve por HTTP en localhost, donde una cookie
// marcada como Secure jamás se enviaría. Se activa mediante COOKIE_SECURE=true
// al desplegar detrás de HTTPS.
const SECURE_COOKIE = process.env.COOKIE_SECURE === "true";

export function setRefreshCookie(response: NextResponse, refreshToken: string): void {
  response.cookies.set({
    name: REFRESH_COOKIE,
    value: refreshToken,
    httpOnly: true,
    sameSite: "lax",
    secure: SECURE_COOKIE,
    path: "/api/auth",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearRefreshCookie(response: NextResponse): void {
  response.cookies.set({
    name: REFRESH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: SECURE_COOKIE,
    path: "/api/auth",
    maxAge: 0,
  });
}
