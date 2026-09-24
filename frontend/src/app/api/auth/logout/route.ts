import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/bff/session";

export const dynamic = "force-dynamic";

/** Cierre de sesión vía BFF: elimina las cookies httpOnly de la sesión. */
export async function POST() {
  const response = NextResponse.json({ success: true, message: "Sesión cerrada", data: null });
  clearSessionCookies(response);
  console.log("[BFF] Logout: cookies de sesión eliminadas");
  return response;
}
