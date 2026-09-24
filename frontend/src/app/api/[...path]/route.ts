import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

type RouteContext = {
  params: { path: string[] };
};

async function proxy(request: NextRequest, { params }: RouteContext) {
  const targetUrl = new URL(`/api/${params.path.join("/")}${request.nextUrl.search}`, BACKEND_API_URL);
  const headers = new Headers();

  ["accept", "authorization", "content-type"].forEach((headerName) => {
    const value = request.headers.get(headerName);
    if (value) headers.set(headerName, value);
  });

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);
    responseHeaders.set("cache-control", "no-store");

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "No fue posible conectar con el servicio interno." },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
