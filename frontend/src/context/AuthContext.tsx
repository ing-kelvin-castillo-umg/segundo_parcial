"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

const INACTIVITY_LIMIT_MS = 10_000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

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
  const router = useRouter();

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const syncSession = () => {
      const session = AuthService.getStoredSession();
      setUser(session?.user || null);
      setToken(session?.token || null);
    };

    const handleExpiredSession = () => {
      setUser(null);
      setToken(null);
      router.push("/login");
    };

    window.addEventListener("auth-session-refreshed", syncSession);
    window.addEventListener("auth-session-expired", handleExpiredSession);

    return () => {
      window.removeEventListener("auth-session-refreshed", syncSession);
      window.removeEventListener("auth-session-expired", handleExpiredSession);
    };
  }, [router]);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.token);
  };

  useEffect(() => {
    if (!token || !user) return;

    let inactivityTimer: ReturnType<typeof setTimeout>;

    const closeSessionByInactivity = async () => {
      console.warn("[AUTH] Sesión cerrada por inactividad. Notificando logout al backend.");
      await AuthService.logout();
      setUser(null);
      setToken(null);
      sessionStorage.setItem("logoutReason", "inactivity");
      router.push("/login?reason=inactivity");
    };

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(closeSessionByInactivity, INACTIVITY_LIMIT_MS);
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [token, user, router]);

  const logout = async () => {
    await AuthService.logout();
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
