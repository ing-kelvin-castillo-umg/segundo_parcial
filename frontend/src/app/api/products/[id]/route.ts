import { proxyToBackend } from "@/lib/server/backend-proxy";

interface ProductRouteContext {
  params: {
    id: string;
  };
}

function productPath(id: string): string {
  return `/api/products/${encodeURIComponent(id)}`;
}

export function GET(request: Request, context: ProductRouteContext): Promise<Response> {
  return proxyToBackend(request, productPath(context.params.id));
}

export function PUT(request: Request, context: ProductRouteContext): Promise<Response> {
  return proxyToBackend(request, productPath(context.params.id));
}

export function DELETE(request: Request, context: ProductRouteContext): Promise<Response> {
  return proxyToBackend(request, productPath(context.params.id));
}
