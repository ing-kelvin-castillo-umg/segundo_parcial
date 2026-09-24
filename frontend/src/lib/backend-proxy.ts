import { NextRequest } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8080";
const FORWARDED_HEADERS = ["authorization", "content-type", "accept"];

export type ProxyRouteContext = {
  params: {
    path?: string[];
  };
};

function buildBackendUrl(request: NextRequest, basePath: string, path: string[] = []): string {
  const normalizedBasePath = basePath.replace(/^\/|\/$/g, "");
  const backendUrl = new URL(`/${[normalizedBasePath, ...path].join("/")}`, BACKEND_API_URL);

  request.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  return backendUrl.toString();
}

function buildHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  FORWARDED_HEADERS.forEach((headerName) => {
    const value = request.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  });

  return headers;
}

export async function proxyToBackend(
  request: NextRequest,
  context: ProxyRouteContext,
  basePath: string,
): Promise<Response> {
  const method = request.method;
  const hasBody = !["GET", "HEAD"].includes(method);

  const response = await fetch(buildBackendUrl(request, basePath, context.params.path), {
    method,
    headers: buildHeaders(request),
    body: hasBody ? await request.text() : undefined,
    cache: "no-store",
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  });
}
