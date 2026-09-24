import { proxyToBackend, ProxyRouteContext } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: ProxyRouteContext): Promise<Response> {
  return proxyToBackend(request, context, "api");
}

export async function POST(request: NextRequest, context: ProxyRouteContext): Promise<Response> {
  return proxyToBackend(request, context, "api");
}

export async function PUT(request: NextRequest, context: ProxyRouteContext): Promise<Response> {
  return proxyToBackend(request, context, "api");
}

export async function DELETE(request: NextRequest, context: ProxyRouteContext): Promise<Response> {
  return proxyToBackend(request, context, "api");
}
