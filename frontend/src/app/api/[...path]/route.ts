import type { NextRequest } from "next/server";

const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8080").replace(/\/$/, "");

async function proxyRequest(request: NextRequest): Promise<Response> {
  const targetUrl = `${BACKEND_URL}${request.nextUrl.pathname}${request.nextUrl.search}`;
  const headers = new Headers();

  for (const header of ["accept", "authorization", "content-type"]) {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  }

  try {
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });
    const responseHeaders = new Headers();

    for (const header of ["content-type", "content-disposition", "cache-control", "www-authenticate"]) {
      const value = backendResponse.headers.get(header);
      if (value) responseHeaders.set(header, value);
    }

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("No fue posible comunicarse con el backend:", error);
    return Response.json(
      { message: "No fue posible conectar con el servicio." },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
