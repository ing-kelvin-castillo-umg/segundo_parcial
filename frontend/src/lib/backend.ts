import { NextRequest, NextResponse } from "next/server";

/**
 * Punto único de contacto con el backend de Spring Boot.
 *
 * Este módulo solo se ejecuta en el servidor de Next.js (Route Handlers), por lo
 * que la variable BACKEND_INTERNAL_URL nunca lleva el prefijo NEXT_PUBLIC_ y, en
 * consecuencia, jamás se incrusta en el bundle que descarga el navegador.
 */
export const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:8080";

/** Construye la URL interna del backend conservando los query params entrantes. */
function buildBackendUrl(request: NextRequest, backendPath: string): string {
  const url = new URL(backendPath, BACKEND_URL);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  return url.toString();
}

/** Copia únicamente los encabezados que el backend necesita recibir. */
function buildForwardHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  headers.set("Accept", "application/json");

  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.set("Authorization", authorization);
  }

  return headers;
}

/**
 * Llama al backend con un cuerpo propio (usado por los handlers de autenticación
 * que necesitan manipular la respuesta antes de devolverla al navegador).
 */
export async function callBackend(
  path: string,
  init: { method: string; body?: unknown; authorization?: string | null }
): Promise<{ status: number; payload: any }> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (init.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (init.authorization) {
    headers["Authorization"] = init.authorization;
  }

  const response = await fetch(new URL(path, BACKEND_URL).toString(), {
    method: init.method,
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const text = await response.text();
  let payload: any = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { success: false, message: text, data: null };
    }
  }

  return { status: response.status, payload };
}

/**
 * Pasarela genérica: reenvía la petición del navegador hacia el backend y
 * devuelve la respuesta tal cual, respetando el código de estado original.
 */
export async function forwardRequest(request: NextRequest, backendPath: string): Promise<NextResponse> {
  const targetUrl = buildBackendUrl(request, backendPath);
  const headers = buildForwardHeaders(request);

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
    if (body) {
      headers.set("Content-Type", request.headers.get("content-type") || "application/json");
    }
  }

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const payload = await backendResponse.text();

    if (!payload) {
      return new NextResponse(null, { status: backendResponse.status });
    }

    return new NextResponse(payload, {
      status: backendResponse.status,
      headers: {
        "Content-Type": backendResponse.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("[BFF] Error al contactar el servicio interno:", (error as Error).message);
    return NextResponse.json(
      { success: false, message: "No fue posible contactar el servicio interno", data: null },
      { status: 502 }
    );
  }
}
