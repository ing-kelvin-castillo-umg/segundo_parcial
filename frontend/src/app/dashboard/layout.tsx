"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { IdleWarningModal } from "@/components/IdleWarningModal";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, sessionEndReason, logout } = useAuth();
  const router = useRouter();

  // Cierre de sesión por inactividad: solo activo mientras hay una sesión en el área privada.
  const { remainingMs, stayActive } = useIdleTimer({
    enabled: isAuthenticated,
    onIdle: () => logout("inactivity"),
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(sessionEndReason ? `/login?reason=${sessionEndReason}` : "/login");
    }
  }, [isAuthenticated, loading, sessionEndReason, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center text-ink-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-3" />
        <p className="text-sm">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-ink-50 text-ink-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>

      {/* Advertencia previa al cierre por inactividad */}
      {remainingMs !== null && (
        <IdleWarningModal
          remainingMs={remainingMs}
          onStayActive={stayActive}
          onLogoutNow={() => logout("inactivity")}
        />
      )}
    </div>
  );
}
