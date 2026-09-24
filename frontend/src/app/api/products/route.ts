import { NextRequest } from "next/server";
import { forwardRequest } from "@/lib/backend";

export const dynamic = "force-dynamic";

/** GET /api/products -> listado y búsqueda del catálogo. */
export async function GET(request: NextRequest) {
  return forwardRequest(request, "/api/products");
}

/** POST /api/products -> alta de producto (restringido a ROLE_ADMIN en el backend). */
export async function POST(request: NextRequest) {
  return forwardRequest(request, "/api/products");
}
