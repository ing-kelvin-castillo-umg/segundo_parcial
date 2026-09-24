import { proxyToBackend, ProxyRouteContext } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: ProxyRouteContext): Promise<Response> {
  return proxyToBackend(request, context, "v3/api-docs");
}
