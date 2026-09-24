import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type RouteContext = { params: Promise<{ id: string }> };

async function productPath(context: RouteContext): Promise<string> {
  const { id } = await context.params;
  return `/api/products/${encodeURIComponent(id)}`;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, await productPath(context));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, await productPath(context));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, await productPath(context));
}
