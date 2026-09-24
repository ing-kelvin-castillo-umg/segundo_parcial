"use client";

import React, { useCallback } from "react";
import { Clock, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";

/** Tiempo de inactividad permitido (NEXT_PUBLIC_IDLE_TIMEOUT_MS, por defecto 30 s). */
const IDLE_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS) || 30_000;
/** Cuánto antes del cierre aparece el aviso (NEXT_PUBLIC_IDLE_WARNING_MS, por defecto 10 s). */
const IDLE_WARNING_MS = Math.min(Number(process.env.NEXT_PUBLIC_IDLE_WARNING_MS) || 10_000, IDLE_TIMEOUT_MS);

function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Cierra la sesión tras un periodo sin actividad del usuario.
 * Se monta solo en el layout privado (dashboard).
 */
export const InactivityGuard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  const handleTimeout = useCallback(() => {
    console.info("[Inactividad] Tiempo límite alcanzado, cerrando sesión...");
    void logout("INACTIVITY");
  }, [logout]);

  const { remainingMs, isWarning, keepAlive } = useInactivityTimer({
    timeoutMs: IDLE_TIMEOUT_MS,
    warningMs: IDLE_WARNING_MS,
    onTimeout: handleTimeout,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  const secondsLeft = Math.ceil(remainingMs / 1000);

  return (
    <>
      {/* Indicador del temporizador de inactividad */}
      <div
        className={`fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border backdrop-blur transition-colors ${
          isWarning
            ? "bg-amber-500/90 text-white border-amber-400"
            : "bg-slate-900/85 text-slate-200 border-slate-700"
        }`}
        title="Tiempo restante antes del cierre de sesión por inactividad"
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Inactividad: {formatClock(remainingMs)}</span>
      </div>

      {/* Modal de advertencia en los últimos segundos */}
      {isWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="inactivity-title"
          aria-describedby="inactivity-description"
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 id="inactivity-title" className="text-lg font-bold text-slate-900">
                ¿Sigues ahí?
              </h2>
              <p id="inactivity-description" className="text-sm text-slate-600">
                Por seguridad, tu sesión se cerrará por inactividad en
              </p>
              <p className="text-4xl font-black tabular-nums text-amber-600" aria-live="assertive">
                {secondsLeft}s
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                autoFocus
                onClick={keepAlive}
                className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
              >
                Seguir conectado
              </button>
              <button
                type="button"
                onClick={() => void logout("MANUAL")}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar sesión ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
