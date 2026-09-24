import { createProxyHandlers } from "@/lib/server/backend-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * BFF catch-all: /api/<ruta> → BACKEND_INTERNAL_URL/api/<ruta>.
 * Las rutas específicas (ej. /api/auth/login/route.ts) tienen prioridad sobre este handler.
 */
const handlers = createProxyHandlers((segments) => `/api/${segments.join("/")}`);

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
