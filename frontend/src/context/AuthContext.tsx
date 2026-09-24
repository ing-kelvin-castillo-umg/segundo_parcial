"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { SESSION_CLEARED_EVENT, TOKEN_KEY, TOKEN_REFRESHED_EVENT } from "@/services/token.manager";
import { useRouter } from "next/navigation";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { INACTIVITY_REASON, LAST_ACTIVITY_KEY, LOGOUT_BROADCAST_KEY, readLastActivity } from "@/services/idle.storage";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [idleTimeoutMs, setIdleTimeoutMs] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  // Sincroniza el estado con la renovación de tokens y con la sesión abierta en otras pestañas.
  useEffect(() => {
    const onRefreshed = (e: Event) => {
      const session = (e as CustomEvent<AuthSession>).detail;
      setUser(session.user);
      setToken(session.token);
    };
    // Refresh token vencido/revocado: se limpia el estado y el dashboard redirige al login.
    const onSessionCleared = () => {
      setUser(null);
      setToken(null);
    };
    const onStorage = (e: StorageEvent) => {
      // Otra pestaña cerró la sesión por inactividad: esta también va al login con el mensaje.
      if (e.key === LOGOUT_BROADCAST_KEY && e.newValue) {
        window.location.replace(`/login?reason=${INACTIVITY_REASON}`);
        return;
      }
      if (e.key !== TOKEN_KEY) return;
      const session = AuthService.getStoredSession();
      setUser(session ? session.user : null);
      setToken(session ? session.token : null);
    };

    window.addEventListener(TOKEN_REFRESHED_EVENT, onRefreshed);
    window.addEventListener(SESSION_CLEARED_EVENT, onSessionCleared);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(TOKEN_REFRESHED_EVENT, onRefreshed);
      window.removeEventListener(SESSION_CLEARED_EVENT, onSessionCleared);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.token);
  };

  // Tiempo de inactividad configurable (variable IDLE_TIMEOUT_MS del servidor).
  useEffect(() => {
    fetch("/api/session-config", { cache: "no-store" })
      .then((r) => r.json())
      .then((c) => setIdleTimeoutMs(Number(c.idleTimeoutMs) || 180000))
      .catch(() => setIdleTimeoutMs(180000));
  }, []);

  // Cierre por inactividad: revoca el refresh token en el backend (POST /api/auth/logout), limpia el
  // almacenamiento y redirige al login con el mensaje. Funciona aunque el access token ya haya expirado.
  const logoutByInactivity = async () => {
    if (!AuthService.getStoredSession()) {
      window.location.replace(`/login?reason=${INACTIVITY_REASON}`); // otra pestaña ya cerró la sesión
      return;
    }
    try {
      localStorage.setItem(LOGOUT_BROADCAST_KEY, String(Date.now())); // avisa a las demás pestañas
    } catch {
      // sin almacenamiento: las demás pestañas cerrarán al detectar la falta de token
    }
    await Promise.race([AuthService.logout("inactivity"), new Promise((resolve) => setTimeout(resolve, 3000))]);
    window.location.replace(`/login?reason=${INACTIVITY_REASON}`);
  };

  useIdleTimer(!!token && !!user && idleTimeoutMs !== null, idleTimeoutMs ?? 180000, logoutByInactivity);

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
    router.push("/");
  };

  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));
  const isAuthenticated = !!token && !!user;

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
