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
        className={`fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tabular-nums shadow-lg border backdrop-blur transition-colors ${
          isWarning
            ? "bg-accent text-accent-foreground border-accent-400"
            : "bg-secondary-900/90 text-secondary-100 border-secondary-700"
        }`}
        title="Tiempo restante antes del cierre de sesión por inactividad"
      >
        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Inactividad: {formatClock(remainingMs)}</span>
      </div>

      {/* Modal de advertencia en los últimos segundos */}
      {isWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-950/70 backdrop-blur-sm px-4 animate-fade-in"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="inactivity-title"
          aria-describedby="inactivity-description"
        >
          <div className="w-full max-w-sm bg-surface rounded-2xl shadow-2xl border border-border p-6 space-y-5 text-center animate-scale-in">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-warning-100 text-warning-700 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h2 id="inactivity-title" className="text-lg font-bold text-foreground">
                ¿Sigues ahí?
              </h2>
              <p id="inactivity-description" className="text-sm text-muted-foreground">
                Por seguridad, tu sesión se cerrará por inactividad en
              </p>
              <p className="text-4xl font-black tabular-nums text-warning-700" aria-live="assertive">
                {secondsLeft}s
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                autoFocus
                onClick={keepAlive}
                className="btn btn-primary w-full"
              >
                Seguir conectado
              </button>
              <button
                type="button"
                onClick={() => void logout("MANUAL")}
                className="btn btn-sm w-full py-2 text-muted-foreground hover:text-danger-700 hover:bg-danger-50"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                Cerrar sesión ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
