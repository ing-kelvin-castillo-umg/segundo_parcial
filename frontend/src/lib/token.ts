/** Utilidades de lectura del access token en el cliente. */

interface JwtPayload {
  sub?: string;
  exp?: number;
  jti?: string;
}

/** Decodifica el payload del JWT sin validar la firma (solo lectura informativa). */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Milisegundos que le restan de vigencia al token (0 si ya venció o es ilegible). */
export function getTimeToExpiry(token: string): number {
  const payload = decodeJwt(token);
  if (!payload?.exp) return 0;
  return Math.max(0, payload.exp * 1000 - Date.now());
}
