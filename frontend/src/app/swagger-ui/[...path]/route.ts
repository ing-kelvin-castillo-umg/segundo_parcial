import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Documentación Swagger servida a través del BFF (sin exponer la URL del backend).
export const GET = (request: NextRequest, { params }: { params: { path: string[] } }) =>
  proxyToBackend(request, ["swagger-ui", ...params.path]);
