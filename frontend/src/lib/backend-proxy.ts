import { NextRequest } from "next/server";

const BACKEND_API_URL = (process.env.BACKEND_API_URL || "http://localhost:8080").replace(/\/+$/, "");

const FORWARDED_HEADERS = ["accept", "authorization", "content-type"];

export async function proxyBackendRequest(request: NextRequest, pathname: string) {
  const backendUrl = `${BACKEND_API_URL}${pathname}${request.nextUrl.search}`;
  const headers = new Headers();

  for (const header of FORWARDED_HEADERS) {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  }

  const body = request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.arrayBuffer();

  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}