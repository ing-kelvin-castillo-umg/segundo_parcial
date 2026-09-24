import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = (process.env.BACKEND_API_URL || "http://localhost:8080").replace(/\/$/, "");

const FORWARDED_RESPONSE_HEADERS = ["content-type", "cache-control", "location"];

function getForwardHeaders(request: NextRequest): Headers {
  const headers = new Headers({ Accept: request.headers.get("accept") || "application/json" });
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  if (authorization) headers.set("Authorization", authorization);
  if (contentType) headers.set("Content-Type", contentType);

  return headers;
}

/**
 * Sends a local /api request to Spring Boot while keeping its URL private from
 * the browser. Only explicitly safe request and response headers are relayed.
 */
export async function proxyToBackend(request: NextRequest, path: string): Promise<NextResponse> {
  const targetUrl = new URL(`${BACKEND_API_URL}${path}`);
  targetUrl.search = new URL(request.url).search;

  try {
    const init: RequestInit = {
      method: request.method,
      headers: getForwardHeaders(request),
      cache: "no-store",
    };

    if (!["GET", "HEAD"].includes(request.method)) {
      init.body = await request.arrayBuffer();
    }

    const upstream = await fetch(targetUrl, init);
    const headers = new Headers();

    FORWARDED_RESPONSE_HEADERS.forEach((header) => {
      const value = upstream.headers.get(header);
      if (value) headers.set(header, value);
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error(`BFF proxy error for ${request.method} ${path}:`, error);
    return NextResponse.json(
      { success: false, message: "No fue posible conectar con el servicio interno." },
      { status: 502 },
    );
  }
}
