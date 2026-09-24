"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { InactivityGuard } from "@/components/InactivityGuard";
import { Loader2, Menu, Package } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, logoutRedirect } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Si hay un logout en curso se respeta su destino (ej. /login?reason=inactividad).
      router.replace(logoutRedirect ?? "/login");
    }
  }, [isAuthenticated, loading, logoutRedirect, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-900 flex flex-col items-center justify-center text-secondary-200" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400 mb-3" aria-hidden="true" />
        <p className="text-sm">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior (solo móvil/tablet) */}
        <header className="lg:hidden sticky top-0 z-30 h-16 px-4 flex items-center gap-3 bg-surface/90 backdrop-blur-lg border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={sidebarOpen}
            aria-controls="dashboard-sidebar"
            className="p-2 -ml-2 rounded-lg text-secondary-900 hover:bg-muted"
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
              <Package className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="font-bold text-secondary-900">UMG Dashboard</span>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>

      {/* Cierre de sesión por inactividad (solo en el área privada) */}
      <InactivityGuard />
    </div>
  );
}
