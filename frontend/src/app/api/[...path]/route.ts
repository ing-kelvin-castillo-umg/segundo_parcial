import { NextRequest } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

type RouteContext = {
  params: { path: string[] };
};

function buildForwardedHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  for (const header of ["accept", "authorization", "content-type"]) {
    const value = request.headers.get(header);
    if (value) {
      headers.set(header, value);
    }
  }

  return headers;
}

async function proxyRequest(request: NextRequest, { params }: RouteContext) {
  const backendUrl = new URL(`/api/${params.path.join("/")}`, BACKEND_API_URL);
  backendUrl.search = request.nextUrl.search;

  try {
    const upstreamResponse = await fetch(backendUrl, {
      method: request.method,
      headers: buildForwardedHeaders(request),
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const contentType = upstreamResponse.headers.get("content-type");

    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "No fue posible comunicarse con el servicio interno.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
