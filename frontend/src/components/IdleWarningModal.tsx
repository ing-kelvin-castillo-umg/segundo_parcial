"use client";

import React from "react";
import { Clock, LogOut } from "lucide-react";

interface IdleWarningModalProps {
  remainingMs: number;
  onStayActive: () => void;
  onLogoutNow: () => void;
}

export const IdleWarningModal: React.FC<IdleWarningModalProps> = ({ remainingMs, onStayActive, onLogoutNow }) => {
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-warning-title"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 id="idle-warning-title" className="text-lg font-bold text-slate-900">
            ¿Sigues ahí?
          </h2>
          <p className="text-sm text-slate-600">
            Por seguridad, tu sesión se cerrará por inactividad en{" "}
            <span className="font-bold text-amber-600 tabular-nums" aria-live="polite">
              {seconds}s
            </span>
            .
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onLogoutNow}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
          <button
            type="button"
            onClick={onStayActive}
            autoFocus
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            Seguir conectado
          </button>
        </div>
      </div>
    </div>
  );
};
