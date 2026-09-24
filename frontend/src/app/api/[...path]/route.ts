import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: { path: string[] } };

const handler = (request: NextRequest, { params }: Context) => proxyToBackend(request, ["api", ...params.path]);

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
