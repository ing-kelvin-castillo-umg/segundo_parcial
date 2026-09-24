import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = (process.env.BACKEND_API_URL || "http://localhost:8080").replace(/\/$/, "");
const ALLOWED_RESOURCES = new Set(["auth", "products"]);
const REQUEST_HEADERS = ["accept", "authorization", "content-type"];
const RESPONSE_HEADERS = ["content-type", "cache-control"];

type RouteContext = {
  params: { path: string[] };
};

async function proxyRequest(request: NextRequest, { params }: RouteContext) {
  const path = params.path ?? [];

  if (!path.length || !ALLOWED_RESOURCES.has(path[0])) {
    return NextResponse.json(
      { success: false, message: "Ruta no permitida por el BFF", data: null },
      { status: 404 },
    );
  }

  const targetUrl = new URL(`/api/${path.map(encodeURIComponent).join("/")}`, BACKEND_API_URL);
  targetUrl.search = request.nextUrl.search;

  const requestHeaders = new Headers();
  for (const headerName of REQUEST_HEADERS) {
    const value = request.headers.get(headerName);
    if (value) requestHeaders.set(headerName, value);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    for (const headerName of RESPONSE_HEADERS) {
      const value = backendResponse.headers.get(headerName);
      if (value) responseHeaders.set(headerName, value);
    }
    responseHeaders.set("x-bff-proxy", "nextjs");

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[BFF] No fue posible contactar el backend:", error);
    return NextResponse.json(
      { success: false, message: "El servicio no está disponible", data: null },
      { status: 502, headers: { "x-bff-proxy": "nextjs" } },
    );
  }
}

export const dynamic = "force-dynamic";
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
