import "server-only";

import { NextRequest, NextResponse } from "next/server";

const LOCAL_BACKEND_URL = "http://localhost:8080";
const DEFAULT_ALLOWED_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000";

function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value.trim());
    const hasOnlyOrigin =
      !url.username &&
      !url.password &&
      (url.pathname === "/" || url.pathname === "") &&
      !url.search &&
      !url.hash;

    if (!hasOnlyOrigin || (url.protocol !== "http:" && url.protocol !== "https:")) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins(): ReadonlySet<string> {
  const configuredOrigins = process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS;
  const origins = configuredOrigins
    .split(",")
    .map(normalizeOrigin)
    .filter((origin): origin is string => origin !== null);

  if (origins.length === 0 || configuredOrigins.split(",").some((origin) => normalizeOrigin(origin) === null)) {
    throw new Error("ALLOWED_ORIGINS contiene uno o más orígenes inválidos");
  }

  return new Set(origins);
}

function getRequestOrigins(request: NextRequest): ReadonlySet<string> {
  const candidates = [request.nextUrl.origin];
  const host = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",", 1)[0]?.trim();

  if (host) {
    candidates.push(`${request.nextUrl.protocol}//${host}`);
  }
  if (forwardedHost && forwardedProto) {
    candidates.push(`${forwardedProto}://${forwardedHost}`);
  }

  return new Set(
    candidates.map(normalizeOrigin).filter((origin): origin is string => origin !== null),
  );
}

function getBackendBaseUrl(): URL {
  const configuredUrl = process.env.BACKEND_INTERNAL_URL || LOCAL_BACKEND_URL;
  const backendUrl = new URL(configuredUrl);

  if (backendUrl.protocol !== "http:" && backendUrl.protocol !== "https:") {
    throw new Error("BACKEND_INTERNAL_URL debe usar el protocolo HTTP o HTTPS");
  }

  return backendUrl;
}

function createForwardHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  for (const headerName of ["accept", "content-type"]) {
    const value = request.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  const accessToken = request.cookies.get("access_token")?.value;
  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

export function rejectInvalidOrigin(request: NextRequest): Response | null {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    return null;
  }

  const origin = request.headers.get("origin");
  const normalizedOrigin = origin ? normalizeOrigin(origin) : null;
  const fetchSite = request.headers.get("sec-fetch-site");
  const isCrossSite = fetchSite === "cross-site";
  const allowedOrigins = getAllowedOrigins();
  const requestOrigins = getRequestOrigins(request);
  const isAllowedOrigin =
    normalizedOrigin !== null &&
    allowedOrigins.has(normalizedOrigin) &&
    requestOrigins.has(normalizedOrigin);

  if (isCrossSite || !isAllowedOrigin) {
    return NextResponse.json(
      { success: false, message: "Origen de la petición no permitido", data: null },
      { status: 403 },
    );
  }

  return null;
}

export async function fetchBackend(backendPath: string, init: RequestInit): Promise<Response> {
  const upstreamUrl = new URL(backendPath, getBackendBaseUrl());
  return fetch(upstreamUrl, { ...init, cache: "no-store" });
}

export async function proxyToBackend(request: NextRequest, backendPath: string): Promise<Response> {
  try {
    const originRejection = rejectInvalidOrigin(request);
    if (originRejection) {
      return originRejection;
    }

    const requestUrl = new URL(request.url);
    const backendPathWithQuery = `${backendPath}${requestUrl.search}`;

    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const body = hasBody ? await request.arrayBuffer() : undefined;
    const upstreamResponse = await fetchBackend(backendPathWithQuery, {
      method: request.method,
      headers: createForwardHeaders(request),
      body: body && body.byteLength > 0 ? body : undefined,
    });

    const responseHeaders = new Headers();
    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    const responseBody = await upstreamResponse.arrayBuffer();

    return new Response(responseBody.byteLength > 0 ? responseBody : null, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "No fue posible comunicarse con el servicio solicitado",
        data: null,
      },
      { status: 502 },
    );
  }
}
