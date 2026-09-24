"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  logoutReason: "manual" | "inactivity" | null;
  login: (username: string, password: string) => Promise<void>;
  logout: (reason?: "manual" | "inactivity") => Promise<void>;
}

const INACTIVITY_LIMIT_MS = 3 * 60 * 1000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousemove",
  "keydown",
  "click",
  "scroll",
  "touchstart",
  "pointerdown",
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutReason, setLogoutReason] = useState<"manual" | "inactivity" | null>(null);
  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));
  const isAuthenticated = !!token && !!user;
  const router = useRouter();
  const logoutStartedRef = useRef(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    logoutStartedRef.current = false;
    setLogoutReason(null);
    setUser(session.user);
    setToken(session.token);
  };

  const logout = useCallback(async (reason: "manual" | "inactivity" = "manual") => {
    if (logoutStartedRef.current) return;
    logoutStartedRef.current = true;
    setLogoutReason(reason);
    setUser(null);
    setToken(null);
    await AuthService.logout();
    router.replace(reason === "inactivity" ? "/login?reason=inactivity" : "/");
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const resetInactivityTimer = () => {
      if (logoutStartedRef.current) return;
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        void logout("inactivity");
      }, INACTIVITY_LIMIT_MS);
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [isAuthenticated, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        logoutReason,
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
