"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { ApiClient } from "@/services/api.client";
import { useRouter } from "next/navigation";

const REFRESH_ADVANCE_MS = 30_000;
const INACTIVITY_TIMEOUT_MS = 120_000;
const INACTIVITY_WARNING_MS = 15_000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

type LogoutReason = "manual" | "inactivity" | "expired";

function getTokenExpiration(token: string): number {
  const encodedPayload = token.split(".")[1];
  if (!encodedPayload) throw new Error("JWT inválido");

  const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const payload = JSON.parse(atob(padded)) as { exp?: number };
  if (!payload.exp) throw new Error("JWT sin fecha de expiración");
  return payload.exp * 1000;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inactivitySeconds, setInactivitySeconds] = useState<number | null>(null);
  const router = useRouter();

  const performLogout = useCallback(async (reason: LogoutReason) => {
    if (reason === "inactivity" || reason === "expired") {
      sessionStorage.setItem("logoutReason", reason);
    } else {
      sessionStorage.removeItem("logoutReason");
    }

    await AuthService.logout(reason);
    setUser(null);
    setToken(null);
    setInactivitySeconds(null);

    if (reason === "inactivity") {
      router.replace("/login?reason=inactivity");
    } else if (reason === "expired") {
      router.replace("/login?reason=session-expired");
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleRefreshed = (event: Event) => {
      setToken((event as CustomEvent<string>).detail);
    };
    const handleExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener("auth:session-refreshed", handleRefreshed);
    window.addEventListener("auth:session-expired", handleExpired);
    return () => {
      window.removeEventListener("auth:session-refreshed", handleRefreshed);
      window.removeEventListener("auth:session-expired", handleExpired);
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    try {
      const refreshAt = getTokenExpiration(token) - REFRESH_ADVANCE_MS;
      const delay = Math.max(refreshAt - Date.now(), 1_000);
      const timer = window.setTimeout(() => {
        ApiClient.refreshAccessToken().catch(() => undefined);
      }, delay);
      return () => window.clearTimeout(timer);
    } catch {
      void performLogout("expired");
    }
  }, [token, performLogout]);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.token);
  };

  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));
  const isAuthenticated = !!token && !!user;

  const logout = useCallback(() => performLogout("manual"), [performLogout]);

  useEffect(() => {
    if (!isAuthenticated) {
      setInactivitySeconds(null);
      return;
    }

    let warningTimer: number | undefined;
    let logoutTimer: number | undefined;
    let countdownTimer: number | undefined;
    let lastActivityAt = 0;

    const clearTimers = () => {
      if (warningTimer) window.clearTimeout(warningTimer);
      if (logoutTimer) window.clearTimeout(logoutTimer);
      if (countdownTimer) window.clearInterval(countdownTimer);
    };

    const scheduleInactivity = () => {
      clearTimers();
      setInactivitySeconds(null);

      warningTimer = window.setTimeout(() => {
        let seconds = Math.ceil(INACTIVITY_WARNING_MS / 1000);
        setInactivitySeconds(seconds);
        countdownTimer = window.setInterval(() => {
          seconds -= 1;
          setInactivitySeconds(Math.max(seconds, 0));
        }, 1_000);
      }, INACTIVITY_TIMEOUT_MS - INACTIVITY_WARNING_MS);

      logoutTimer = window.setTimeout(() => {
        void performLogout("inactivity");
      }, INACTIVITY_TIMEOUT_MS);
    };

    const registerActivity = () => {
      const now = Date.now();
      if (now - lastActivityAt < 1_000) return;
      lastActivityAt = now;
      scheduleInactivity();
    };

    scheduleInactivity();
    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, registerActivity, { passive: true });
    }

    return () => {
      clearTimers();
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, registerActivity);
      }
    };
  }, [isAuthenticated, performLogout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        logout,
      }}
    >
      {children}
      {inactivitySeconds !== null && isAuthenticated && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm pointer-events-none">
          <div className="w-full max-w-sm rounded-2xl border border-amber-400/40 bg-slate-900 p-6 text-center text-white shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
              Inactividad detectada
            </p>
            <h2 className="mt-2 text-xl font-bold">Tu sesión está por cerrarse</h2>
            <p className="mt-2 text-sm text-slate-300">
              Por seguridad, cerraremos la sesión en
            </p>
            <p className="mt-3 text-4xl font-black text-amber-300">
              {inactivitySeconds}s
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Mueve el mouse o presiona una tecla para continuar.
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
