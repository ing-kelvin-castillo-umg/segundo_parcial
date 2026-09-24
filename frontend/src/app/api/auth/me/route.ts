import { proxyToBackend } from "@/lib/server/backend-proxy";
import { NextRequest } from "next/server";

export function GET(request: NextRequest): Promise<Response> {
  return proxyToBackend(request, "/api/auth/me");
}
