"use client";

import React from "react";
import { ShieldAlert, LogIn } from "lucide-react";

interface IdleWarningModalProps {
  open: boolean;
  remainingMs: number;
  onStayConnected: () => void;
  onLogoutNow: () => void;
}

/** Aviso previo al cierre automático, con cuenta regresiva. */
export const IdleWarningModal: React.FC<IdleWarningModalProps> = ({
  open,
  remainingMs,
  onStayConnected,
  onLogoutNow,
}) => {
  if (!open) return null;

  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-6 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">¿Sigues ahí?</h2>
          <p className="text-sm text-slate-600">
            No hemos detectado actividad en tu sesión. Por seguridad, se cerrará automáticamente en:
          </p>
          <p className="text-4xl font-black text-rose-600 tabular-nums">{seconds}s</p>
          <p className="text-xs text-slate-500">
            Cualquier movimiento del ratón o pulsación de tecla también reinicia el contador.
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onLogoutNow}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors"
          >
            Cerrar sesión ahora
          </button>
          <button
            type="button"
            onClick={onStayConnected}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Seguir conectado
          </button>
        </div>
      </div>
    </div>
  );
};
