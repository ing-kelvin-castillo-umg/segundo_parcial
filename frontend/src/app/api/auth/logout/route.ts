import { NextRequest } from "next/server";
import { proxyLogout } from "@/app/api/_lib/auth-proxy";

export async function POST(request: NextRequest) {
  return proxyLogout(request);
}
