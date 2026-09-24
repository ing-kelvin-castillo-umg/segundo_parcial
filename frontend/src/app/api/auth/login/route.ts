import { NextRequest } from "next/server";
import { forwardRequest } from "@/lib/backend";

export const dynamic = "force-dynamic";

/** POST /api/auth/login -> reenvía las credenciales al backend interno. */
export async function POST(request: NextRequest) {
  return forwardRequest(request, "/api/auth/login");
}
