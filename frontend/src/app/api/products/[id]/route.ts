import { NextRequest } from "next/server";
import { proxyToBackend } from "@/app/api/_lib/backend-proxy";

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  return proxyToBackend(request, `/api/products/${encodeURIComponent(params.id)}`);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  return proxyToBackend(request, `/api/products/${encodeURIComponent(params.id)}`);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return proxyToBackend(request, `/api/products/${encodeURIComponent(params.id)}`);
}
