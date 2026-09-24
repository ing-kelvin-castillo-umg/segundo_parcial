import { NextRequest, NextResponse } from "next/server";

/**
 * Pasarela (BFF) hacia Spring Boot. La URL real del backend solo existe en el
 * servidor (variable BACKEND_URL, sin prefijo NEXT_PUBLIC_) y nunca llega al navegador.
 */
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8080").replace(/\/+$/, "");

/** Recursos del backend que el proxy tiene permitido alcanzar (evita destinos arbitrarios). */
const ALLOWED_PREFIXES = ["api/auth", "api/products", "swagger-ui", "v3/api-docs"];

/** Encabezados de la petición que sí se reenvían al backend. */
const FORWARDED_REQUEST_HEADERS = ["authorization", "content-type", "accept", "accept-language"];

/** Encabezados de la respuesta que se devuelven al navegador. */
const FORWARDED_RESPONSE_HEADERS = ["content-type", "cache-control", "location", "www-authenticate"];

const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"]);
const NULL_BODY_STATUS = new Set([101, 204, 205, 304]);
const UPSTREAM_TIMEOUT_MS = 15000;

function errorResponse(status: number, message: string) {
  return NextResponse.json({ success: false, message, data: null }, { status });
}

/**
 * Llamada directa al backend desde los Route Handlers de autenticación (login/refresh/logout).
 * Devuelve null si el backend no responde.
 */
export async function backendFetch(path: string, init: { method: string; body?: string; accept?: string }): Promise<Response | null> {
  try {
    return await fetch(`${BACKEND_URL}${path}`, {
      method: init.method,
      headers: { "content-type": "application/json", accept: init.accept ?? "application/json" },
      body: init.body,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return null;
  }
}

export { errorResponse };

/** Normaliza y valida la ruta pedida; devuelve null si no está permitida. */
function resolveBackendPath(segments: string[]): string | null {
  if (segments.length === 0) return null;
  for (const segment of segments) {
    if (segment === "" || segment === "." || segment === ".." || /[\/\0]/.test(segment)) return null;
  }
  const path = segments.join("/");
  const allowed = ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  return allowed ? path : null;
}

export async function proxyToBackend(request: NextRequest, segments: string[]): Promise<Response> {
  const backendPath = resolveBackendPath(segments);
  if (!backendPath) {
    return errorResponse(404, "Recurso no encontrado");
  }

  const target = `${BACKEND_URL}/${backendPath}${request.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  // Host público con el que el navegador llegó al BFF, para que el backend genere URLs correctas.
  const publicHost = request.headers.get("host");
  if (publicHost) headers.set("x-forwarded-host", publicHost);
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  };
  if (!METHODS_WITHOUT_BODY.has(request.method)) {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    return errorResponse(502, "No fue posible comunicarse con el servicio de backend");
  }

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (!value) continue;
    // Si el backend redirige con su URL interna, se reescribe a una ruta relativa.
    responseHeaders.set(name, name === "location" && value.startsWith(BACKEND_URL) ? value.slice(BACKEND_URL.length) || "/" : value);
  }

  const body = NULL_BODY_STATUS.has(upstream.status) ? null : await upstream.arrayBuffer();
  return new Response(body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
}
