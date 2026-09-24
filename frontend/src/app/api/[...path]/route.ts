import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

async function proxyRequest(request: NextRequest, context: { params: { path: string[] } }) {
  const path = context.params.path.join("/");
  const backendUrl = `${BACKEND_API_URL}/api/${path}${request.nextUrl.search}`;
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("content-length");

  const body = request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.arrayBuffer();

  try {
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servicio de backend" },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;