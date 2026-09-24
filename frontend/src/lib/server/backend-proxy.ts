import "server-only";

const LOCAL_BACKEND_URL = "http://localhost:8080";

function getBackendBaseUrl(): URL {
  const configuredUrl = process.env.BACKEND_INTERNAL_URL || LOCAL_BACKEND_URL;
  const backendUrl = new URL(configuredUrl);

  if (backendUrl.protocol !== "http:" && backendUrl.protocol !== "https:") {
    throw new Error("BACKEND_INTERNAL_URL debe usar el protocolo HTTP o HTTPS");
  }

  return backendUrl;
}

function createForwardHeaders(request: Request): Headers {
  const headers = new Headers();

  for (const headerName of ["accept", "authorization", "content-type"]) {
    const value = request.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  return headers;
}

export async function proxyToBackend(request: Request, backendPath: string): Promise<Response> {
  try {
    const requestUrl = new URL(request.url);
    const upstreamUrl = new URL(backendPath, getBackendBaseUrl());
    upstreamUrl.search = requestUrl.search;

    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const body = hasBody ? await request.arrayBuffer() : undefined;
    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: createForwardHeaders(request),
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    const responseBody = await upstreamResponse.arrayBuffer();

    return new Response(responseBody.byteLength > 0 ? responseBody : null, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "No fue posible comunicarse con el servicio solicitado",
        data: null,
      },
      { status: 502 },
    );
  }
}
