import "server-only";

import { NextRequest, NextResponse } from "next/server";

/**
 * URL interna del backend. Solo existe del lado del servidor (sin prefijo NEXT_PUBLIC_),
 * por lo que nunca se incrusta en el bundle del navegador.
 */
const BACKEND_INTERNAL_URL = (process.env.BACKEND_INTERNAL_URL || "http://localhost:8080").replace(/\/+$/, "");

/** Headers del cliente que se reenvían al backend. */
const FORWARDED_REQUEST_HEADERS = ["authorization", "content-type", "accept", "accept-language"];

/** Headers hop-by-hop que nunca deben cruzar el proxy. */
const HOP_BY_HOP_HEADERS = [
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "upgrade",
  "content-length",
  "transfer-encoding",
];

/** fetch de Node ya descomprime el body, así que estos headers dejarían de ser válidos. */
const STRIPPED_RESPONSE_HEADERS = [...HOP_BY_HOP_HEADERS, "content-encoding"];

const PROXY_TIMEOUT_MS = 30_000;

export interface ProxyOptions {
  /** Headers adicionales (o que sobrescriben) para enviar al backend. */
  headers?: Record<string, string>;
  /** Body a enviar en lugar del body original de la petición. */
  body?: BodyInit | null;
}

function buildRequestHeaders(req: NextRequest, extra?: Record<string, string>): Headers {
  const headers = new Headers();

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }

  // Información del cliente original, útil para logs del backend.
  const host = req.headers.get("host");
  if (host) headers.set("x-forwarded-host", host);
  headers.set("x-forwarded-proto", req.nextUrl.protocol.replace(":", ""));
  const forwardedFor = req.headers.get("x-forwarded-for") || req.ip;
  if (forwardedFor) headers.set("x-forwarded-for", forwardedFor);

  for (const [name, value] of Object.entries(extra ?? {})) {
    headers.set(name, value);
  }

  for (const name of HOP_BY_HOP_HEADERS) {
    headers.delete(name);
  }

  return headers;
}

function buildResponseHeaders(backendRes: Response): Headers {
  const headers = new Headers(backendRes.headers);

  for (const name of STRIPPED_RESPONSE_HEADERS) {
    headers.delete(name);
  }

  // Si el backend redirige a su propia URL interna, se reescribe hacia el BFF.
  const location = headers.get("location");
  if (location?.startsWith(BACKEND_INTERNAL_URL)) {
    headers.set("location", location.slice(BACKEND_INTERNAL_URL.length) || "/");
  }

  headers.set("X-Proxied-By", "nextjs-bff");
  return headers;
}

/**
 * Reenvía la petición entrante al backend en `backendPath` (ej. "/api/products/1"),
 * conservando método, query string, body y headers relevantes.
 * Devuelve status, headers y body del backend tal cual, o 502 si no está disponible.
 */
export async function proxyToBackend(
  req: NextRequest,
  backendPath: string,
  options: ProxyOptions = {}
): Promise<Response> {
  const path = backendPath.startsWith("/") ? backendPath : `/${backendPath}`;
  const targetUrl = `${BACKEND_INTERNAL_URL}${path}${req.nextUrl.search}`;
  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  let body: BodyInit | null | undefined = undefined;
  if (options.body !== undefined) {
    body = options.body;
  } else if (hasBody) {
    const buffer = await req.arrayBuffer();
    body = buffer.byteLength > 0 ? buffer : undefined;
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method,
      headers: buildRequestHeaders(req, options.headers),
      body,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
    });

    const responseBody = method === "HEAD" || backendRes.status === 204 || backendRes.status === 304
      ? null
      : await backendRes.arrayBuffer();

    return new Response(responseBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: buildResponseHeaders(backendRes),
    });
  } catch (error: any) {
    console.error(`[BFF] ${method} ${targetUrl} falló:`, error?.cause?.code || error?.message || error);

    return NextResponse.json(
      {
        success: false,
        message: "El servicio backend no está disponible. Intenta nuevamente en unos momentos.",
        data: null,
      },
      { status: 502, headers: { "X-Proxied-By": "nextjs-bff" } }
    );
  }
}

/** Crea los handlers GET/POST/PUT/PATCH/DELETE para un Route Handler catch-all. */
export function createProxyHandlers(resolvePath: (segments: string[]) => string) {
  const handler = (req: NextRequest, { params }: { params: { path?: string[] } }) =>
    proxyToBackend(req, resolvePath((params.path ?? []).map(encodeURIComponent)));

  return { GET: handler, POST: handler, PUT: handler, PATCH: handler, DELETE: handler };
}
