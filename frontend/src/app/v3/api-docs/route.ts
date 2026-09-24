import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backend-proxy";

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, "/v3/api-docs");
}