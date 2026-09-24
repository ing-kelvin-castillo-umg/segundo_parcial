import { createProxyHandlers } from "@/lib/server/backend-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Proxy del documento OpenAPI del backend (/v3/api-docs y /v3/api-docs/**). */
const handlers = createProxyHandlers((segments) =>
  segments.length ? `/v3/api-docs/${segments.join("/")}` : "/v3/api-docs"
);

export const GET = handlers.GET;
