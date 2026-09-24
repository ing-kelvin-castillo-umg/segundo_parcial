import { NextRequest, NextResponse } from "next/server";

const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL;
const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const FORWARDED_HEADERS = ["accept", "authorization", "content-type"];

/** Executes a BFF-to-backend request without exposing the target URL to the client. */
export async function requestBackend(
  request: NextRequest,
  backendPath: string,
  bodyOverride?: BodyInit,
): Promise<Response> {
  if (!BACKEND_INTERNAL_URL) {
    throw new Error("BACKEND_INTERNAL_URL is not configured");
  }

  const headers = new Headers();
  FORWARDED_HEADERS.forEach((headerName) => {
    const value = request.headers.get(headerName);
    if (value) headers.set(headerName, value);
  });

  const backendUrl = `${BACKEND_INTERNAL_URL.replace(/\/$/, "")}${backendPath}${request.nextUrl.search}`;
  const requestInit: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (bodyOverride !== undefined) {
    headers.set("content-type", "application/json");
    requestInit.body = bodyOverride;
  } else if (BODY_METHODS.has(request.method)) {
    const body = await request.arrayBuffer();
    if (body.byteLength > 0) requestInit.body = body;
  }

  return fetch(backendUrl, requestInit);
}

export async function backendResponseToNextResponse(backendResponse: Response): Promise<NextResponse> {
  const responseHeaders = new Headers();
  const contentType = backendResponse.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);

  const body = backendResponse.status === 204 ? null : await backendResponse.arrayBuffer();
  return new NextResponse(body && body.byteLength > 0 ? body : null, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

/** Server-only BFF helper. The internal backend address is never client-side. */
export async function proxyToBackend(request: NextRequest, backendPath: string): Promise<NextResponse> {
  if (!BACKEND_INTERNAL_URL) {
    return NextResponse.json(
      {
        success: false,
        message: "La configuración BACKEND_INTERNAL_URL no está disponible.",
        data: null,
      },
      { status: 500 },
    );
  }

  const headers = new Headers();

  FORWARDED_HEADERS.forEach((headerName) => {
    const value = request.headers.get(headerName);
    if (value) headers.set(headerName, value);
  });

  const backendUrl = `${BACKEND_INTERNAL_URL.replace(/\/$/, "")}${backendPath}${request.nextUrl.search}`;
  const requestInit: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (BODY_METHODS.has(request.method)) {
    const body = await request.arrayBuffer();
    if (body.byteLength > 0) requestInit.body = body;
  }

  try {
    const backendResponse = await fetch(backendUrl, requestInit);
    const responseHeaders = new Headers();
    const contentType = backendResponse.headers.get("content-type");

    if (contentType) responseHeaders.set("content-type", contentType);

    const body = backendResponse.status === 204 ? null : await backendResponse.arrayBuffer();

    return new NextResponse(body && body.byteLength > 0 ? body : null, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "No fue posible comunicarse con el servicio interno.",
        data: null,
      },
      { status: 502 },
    );
  }
}
