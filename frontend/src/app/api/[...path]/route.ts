import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, getAccessToken } from "@/bff/session";

/**
 * BFF / Proxy inverso.
 *
 * El navegador solo conoce las rutas locales de Next.js (/api/...). Este Route Handler
 * reenvía la petición al backend de Spring Boot por la red interna de Docker y devuelve
 * la respuesta tal cual. La URL real del backend vive en BACKEND_URL, una variable
 * exclusiva del servidor (sin prefijo NEXT_PUBLIC_), por lo que nunca llega al bundle del cliente.
 *
 * El access token viaja en la cookie httpOnly "access_token" y aquí se traduce al encabezado
 * Authorization: Bearer que espera el backend. Login, refresh y logout tienen sus propios handlers en /api/auth/*.
 */

export const dynamic = "force-dynamic";

// Solo se reenvían los encabezados que el backend necesita; el resto (Host, Origin, Cookie...) se descarta.
const FORWARDED_REQUEST_HEADERS = ["content-type", "accept"];

async function proxy(request: NextRequest, { params }: { params: { path: string[] } }) {
  const targetUrl = `${BACKEND_URL}/api/${params.path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const accessToken = getAccessToken(request);
  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });

    console.log(`[BFF] ${request.method} /api/${params.path.join("/")} -> backend ${backendResponse.status}`);

    const body = await backendResponse.arrayBuffer();
    const responseHeaders = new Headers();
    const contentType = backendResponse.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);

    return new NextResponse(body.byteLength ? body : null, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error(`[BFF] Error al contactar el backend (${request.method} ${targetUrl}):`, error.message);
    return NextResponse.json(
      { success: false, message: "Servicio no disponible. Intente más tarde.", data: null },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
