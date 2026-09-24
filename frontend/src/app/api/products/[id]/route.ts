import { proxyToBackend } from "@/lib/server/backend-proxy";
import { NextRequest } from "next/server";

interface ProductRouteContext {
  params: {
    id: string;
  };
}

function productPath(id: string): string {
  return `/api/products/${encodeURIComponent(id)}`;
}

export function GET(request: NextRequest, context: ProductRouteContext): Promise<Response> {
  return proxyToBackend(request, productPath(context.params.id));
}

export function PUT(request: NextRequest, context: ProductRouteContext): Promise<Response> {
  return proxyToBackend(request, productPath(context.params.id));
}

export function DELETE(request: NextRequest, context: ProductRouteContext): Promise<Response> {
  return proxyToBackend(request, productPath(context.params.id));
}
