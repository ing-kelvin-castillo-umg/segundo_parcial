export const dynamic = "force-dynamic";

type RouteContext = {
  params: { path: string[] };
};

function buildBackendUrl(request: Request, path: string[]): string {
  const base = (process.env.BACKEND_URL || "http://localhost:8080").replace(/\/$/, "");
  const query = new URL(request.url).search;
  return `${base}/api/${path.join("/")}${query}`;
}

async function proxy(request: Request, { params }: RouteContext): Promise<Response> {
  const headers = new Headers();
  const authorization = request.headers.get("Authorization");
  const contentType = request.headers.get("Content-Type");

  if (authorization) {
    headers.set("Authorization", authorization);
  }
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;

  const backendResponse = await fetch(buildBackendUrl(request, params.path), {
    method: request.method,
    headers,
    body: body && body.length > 0 ? body : undefined,
    cache: "no-store",
  });

  const text = await backendResponse.text();
  const payload = text ? JSON.parse(text) : null;

  return Response.json(payload, { status: backendResponse.status });
}

export function GET(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export function POST(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export function PUT(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export function DELETE(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export function PATCH(request: Request, context: RouteContext) {
  return proxy(request, context);
}
