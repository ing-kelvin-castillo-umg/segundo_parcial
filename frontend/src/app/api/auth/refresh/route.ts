import { NextRequest } from "next/server";
import { proxyRefresh } from "@/app/api/_lib/auth-proxy";

export async function POST(request: NextRequest) {
  return proxyRefresh(request);
}
