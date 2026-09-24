import { NextRequest } from "next/server";

export const runtime = "nodejs";

const HOP_BY_HOP_HEADERS = [
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
];

type RouteContext = { params: { path: string[] } };

async function proxy(request: NextRequest, { params }: RouteContext): Promise<Response> {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
  const path = params.path.map(encodeURIComponent).join("/");
  const url = new URL(`/api/${path}${request.nextUrl.search}`, backendUrl);

  const requestHeaders = new Headers(request.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => requestHeaders.delete(header));
  requestHeaders.delete("accept-encoding");

  try {
    const upstream = await fetch(url, {
      method: request.method,
      headers: requestHeaders,
      body: request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers(upstream.headers);
    HOP_BY_HOP_HEADERS.forEach((header) => responseHeaders.delete(header));
    responseHeaders.delete("content-encoding");

    // A redirect from Spring must not reveal the internal backend origin.
    const location = responseHeaders.get("location");
    if (location) {
      const redirectUrl = new URL(location, url);
      if (redirectUrl.origin === url.origin) {
        responseHeaders.set("location", `${request.nextUrl.origin}${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`);
      }
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("No se pudo conectar con el backend:", error);
    return Response.json({ success: false, message: "Servicio temporalmente no disponible" }, { status: 502 });
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
