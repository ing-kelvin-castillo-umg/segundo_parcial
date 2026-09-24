import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backend-proxy";

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  return proxyBackendRequest(request, `/swagger-ui/${context.params.path.join("/")}`);
}