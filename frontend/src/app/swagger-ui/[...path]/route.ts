import { createProxyHandlers } from "@/lib/server/backend-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Proxy de la interfaz de Swagger UI del backend (/swagger-ui/**). */
const handlers = createProxyHandlers((segments) => `/swagger-ui/${segments.join("/")}`);

export const GET = handlers.GET;
