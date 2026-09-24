import { proxyToBackend } from "@/lib/server/backend-proxy";
import { NextRequest } from "next/server";

const PRODUCTS_PATH = "/api/products";

export function GET(request: NextRequest): Promise<Response> {
  return proxyToBackend(request, PRODUCTS_PATH);
}

export function POST(request: NextRequest): Promise<Response> {
  return proxyToBackend(request, PRODUCTS_PATH);
}
