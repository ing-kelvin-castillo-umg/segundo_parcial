import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_IDLE_TIMEOUT_MS = 180_000; // 3 minutos
const MIN_IDLE_TIMEOUT_MS = 5_000;

// Tiempo de inactividad configurable por variable de entorno del servidor (IDLE_TIMEOUT_MS), sin recompilar.
export function GET() {
  const configured = Number(process.env.IDLE_TIMEOUT_MS);
  const idleTimeoutMs = Number.isFinite(configured) && configured >= MIN_IDLE_TIMEOUT_MS ? configured : DEFAULT_IDLE_TIMEOUT_MS;
  return NextResponse.json({ idleTimeoutMs }, { headers: { "cache-control": "no-store" } });
}
