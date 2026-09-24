"use client";

import React from "react";
import { Clock, ShieldAlert } from "lucide-react";

interface SessionTimerProps {
  remainingMs: number;
  isWarning: boolean;
}

function formatMmSs(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Cronómetro de sesión: muestra cuánto falta para el cierre por inactividad. */
export const SessionTimer: React.FC<SessionTimerProps> = ({ remainingMs, isWarning }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold tabular-nums transition-colors ${
        isWarning
          ? "bg-danger-50 border-danger-200 text-danger-700"
          : "bg-white border-surface-200 text-surface-600"
      }`}
      title="Tiempo restante antes del cierre automático por inactividad"
    >
      {isWarning ? (
        <ShieldAlert className="w-4 h-4 text-danger-600" />
      ) : (
        <Clock className="w-4 h-4 text-surface-400" />
      )}
      <span className="hidden sm:inline text-[11px] uppercase tracking-wide font-medium opacity-70">
        Sesión
      </span>
      <span>{formatMmSs(remainingMs)}</span>
    </div>
  );
};
