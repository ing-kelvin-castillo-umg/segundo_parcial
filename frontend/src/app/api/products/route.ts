import { proxyToBackend } from "@/lib/server/backend-proxy";

const PRODUCTS_PATH = "/api/products";

export function GET(request: Request): Promise<Response> {
  return proxyToBackend(request, PRODUCTS_PATH);
}

export function POST(request: Request): Promise<Response> {
  return proxyToBackend(request, PRODUCTS_PATH);
}
