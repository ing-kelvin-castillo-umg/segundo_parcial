"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { SessionTimer } from "@/components/SessionTimer";
import { IdleWarningModal } from "@/components/IdleWarningModal";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { Loader2 } from "lucide-react";

/** Tiempo máximo de inactividad permitido dentro del área privada. */
const IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutos

/** Antelación con la que se avisa al usuario antes de cerrar la sesión. */
const IDLE_WARNING_MS = 30 * 1000; // 30 segundos

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  // Evita que un segundo disparo del temporizador lance dos cierres de sesión.
  const closingRef = useRef(false);

  useEffect(() => {
    // Durante un cierre de sesión en curso, la redirección la decide el propio
    // logout (que añade el motivo a la URL); este guard no debe pisarla.
    if (closingRef.current) return;

    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleIdleTimeout = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    void logout("inactivity");
  }, [logout]);

  const { remainingMs, isWarning, reset } = useIdleTimeout({
    timeoutMs: IDLE_TIMEOUT_MS,
    warningMs: IDLE_WARNING_MS,
    onTimeout: handleIdleTimeout,
    enabled: isAuthenticated && !loading,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center text-surface-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <p className="text-sm">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-surface-50 text-surface-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Indicador permanente del tiempo restante de sesión */}
        <div className="sticky top-0 z-30 flex items-center justify-end gap-3 px-5 lg:px-10 py-4 bg-surface-50/80 backdrop-blur-sm">
          {/* Hueco reservado al botón de menú en pantallas pequeñas */}
          <span className="lg:hidden w-10 mr-auto" aria-hidden="true" />
          <SessionTimer remainingMs={remainingMs} isWarning={isWarning} />
        </div>

        {children}
      </div>

      <IdleWarningModal
        open={isWarning && remainingMs > 0}
        remainingMs={remainingMs}
        onStayConnected={reset}
        onLogoutNow={() => {
          closingRef.current = true;
          void logout("inactivity");
        }}
      />
    </div>
  );
}
