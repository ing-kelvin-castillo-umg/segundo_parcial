import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backend-proxy";

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  return proxyBackendRequest(request, `/api/${context.params.path.join("/")}`);
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  return proxyBackendRequest(request, `/api/${context.params.path.join("/")}`);
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  return proxyBackendRequest(request, `/api/${context.params.path.join("/")}`);
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  return proxyBackendRequest(request, `/api/${context.params.path.join("/")}`);
}