import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = (request: NextRequest, { params }: { params: { path?: string[] } }) =>
  proxyToBackend(request, ["v3", "api-docs", ...(params.path ?? [])]);
