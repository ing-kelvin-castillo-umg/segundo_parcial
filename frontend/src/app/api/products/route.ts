import { NextRequest } from "next/server";
import { proxyToBackend } from "@/app/api/_lib/backend-proxy";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/products");
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/products");
}
