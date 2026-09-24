import { NextRequest } from "next/server";
import { forwardRequest } from "@/lib/backend";

export const dynamic = "force-dynamic";

/** GET /api/auth/me -> perfil del usuario autenticado. */
export async function GET(request: NextRequest) {
  return forwardRequest(request, "/api/auth/me");
}
