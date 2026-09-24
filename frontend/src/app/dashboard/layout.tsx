"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { formatSessionTime } from "@/config/session";
import { AlertTriangle, Loader2, TimerReset } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, isInactivityWarning, remainingSeconds, resetInactivityTimer, logoutReason } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace(logoutReason === "inactivity" ? "/login?reason=inactivity" : "/login");
  }, [isAuthenticated, loading, logoutReason, router]);

  if (loading) return <div className="flex min-h-screen flex-col items-center justify-center bg-brand-950 text-brand-100"><Loader2 className="mb-3 h-8 w-8 animate-spin text-jade-300" /><p className="text-sm">Verificando sesión...</p></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-stone-100 text-zinc-900">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto pt-14 lg:pt-0">{children}</main>
      {isInactivityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/55 px-4 backdrop-blur-sm">
          <div role="alertdialog" aria-modal="true" aria-labelledby="inactivity-warning-title" className="w-full max-w-md rounded-3xl border border-amber-300 bg-stone-50 p-6 shadow-2xl shadow-brand-950/30">
            <div className="flex items-start gap-4"><div className="rounded-2xl bg-amber-100 p-3 text-amber-700"><AlertTriangle className="h-6 w-6" /></div><div><h2 id="inactivity-warning-title" className="font-bold text-zinc-900">Sesión por expirar</h2><p className="mt-1 text-sm text-stone-600">Tu sesión está por cerrarse debido a inactividad.</p></div></div>
            <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">La sesión se cerrará automáticamente en <strong>{formatSessionTime(remainingSeconds)}</strong></p>
            <button onClick={resetInactivityTimer} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-600"><TimerReset className="h-4 w-4" />Continuar sesión</button>
          </div>
        </div>
      )}
    </div>
  );
}
