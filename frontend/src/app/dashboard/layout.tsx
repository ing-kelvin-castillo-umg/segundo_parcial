"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { formatSessionTime } from "@/config/session";
import { AlertTriangle, Loader2, TimerReset } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, isInactivityWarning, remainingSeconds, resetInactivityTimer, logoutReason } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(logoutReason === "inactivity" ? "/login?reason=inactivity" : "/login");
    }
  }, [isAuthenticated, loading, logoutReason, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p className="text-sm">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>

      {isInactivityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="inactivity-warning-title"
            className="w-full max-w-md rounded-2xl border border-amber-300 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 id="inactivity-warning-title" className="font-bold text-slate-900">Sesión por expirar</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Tu sesión está por cerrarse debido a inactividad.
                </p>
              </div>
            </div>
            <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
              La sesión se cerrará automáticamente en <strong>{formatSessionTime(remainingSeconds)}</strong>
            </p>
            <button
              onClick={resetInactivityTimer}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
            >
              <TimerReset className="h-4 w-4" />
              Continuar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
