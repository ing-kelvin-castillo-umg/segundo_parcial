import { NextRequest } from "next/server";
import { forwardRequest } from "@/lib/backend";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

/** GET /api/products/{id} -> detalle de un producto. */
export async function GET(request: NextRequest, { params }: RouteContext) {
  return forwardRequest(request, `/api/products/${params.id}`);
}

/** PUT /api/products/{id} -> actualización (restringida a ROLE_ADMIN en el backend). */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  return forwardRequest(request, `/api/products/${params.id}`);
}

/** DELETE /api/products/{id} -> eliminación (restringida a ROLE_ADMIN en el backend). */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return forwardRequest(request, `/api/products/${params.id}`);
}
