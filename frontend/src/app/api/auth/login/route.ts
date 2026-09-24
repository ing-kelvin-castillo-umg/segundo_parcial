import { proxyToBackend } from "@/lib/server/backend-proxy";

export function POST(request: Request): Promise<Response> {
  return proxyToBackend(request, "/api/auth/login");
}
