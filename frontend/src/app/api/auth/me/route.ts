import { proxyToBackend } from "@/lib/server/backend-proxy";

export function GET(request: Request): Promise<Response> {
  return proxyToBackend(request, "/api/auth/me");
}
