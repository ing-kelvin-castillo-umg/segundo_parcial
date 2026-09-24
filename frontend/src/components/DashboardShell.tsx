"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { InactivityGuard } from "@/components/InactivityGuard";
import { Sidebar } from "@/components/Sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  inactivityTimeoutMs: number;
}

export function DashboardShell({ children, inactivityTimeoutMs }: DashboardShellProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-background flex flex-col items-center justify-center text-dark-muted/70">
        <Loader2 className="w-8 h-8 animate-spin text-primary-medium mb-3" />
        <p className="text-sm">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <InactivityGuard timeoutMs={inactivityTimeoutMs} />
      <div className="min-h-screen flex flex-col lg:flex-row bg-canvas text-ink">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
