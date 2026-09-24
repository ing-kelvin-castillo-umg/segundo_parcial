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
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const INACTIVITY_TIMEOUT_MS = 10 * 1000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "pointerdown",
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [accessTokenExpiresAt, setAccessTokenExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef<number | null>(null);
  const lastActivityAtRef = useRef(Date.now());
  const endingSessionRef = useRef(false);
  const router = useRouter();

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
      setAccessTokenExpiresAt(session.accessTokenExpiresAt);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    lastActivityAtRef.current = Date.now();
    setUser(session.user);
    setToken(session.token);
    setAccessTokenExpiresAt(session.accessTokenExpiresAt);
  };

  useEffect(() => {
    if (!token || !accessTokenExpiresAt) return;

    const renewalDelay = Math.max(accessTokenExpiresAt - Date.now() - 60_000, 1_000);
    const timeout = window.setTimeout(async () => {
      try {
        const session = await AuthService.refreshSession();
        setUser(session.user);
        setToken(session.token);
        setAccessTokenExpiresAt(session.accessTokenExpiresAt);
      } catch {
        void AuthService.logout();
        setUser(null);
        setToken(null);
        setAccessTokenExpiresAt(null);
        router.push("/login?reason=session-expired");
      }
    }, renewalDelay);

    return () => window.clearTimeout(timeout);
  }, [token, accessTokenExpiresAt, router]);

  const logout = useCallback(async (reason: "manual" | "inactivity" = "manual") => {
    if (endingSessionRef.current) return;

    endingSessionRef.current = true;
    clearInactivityTimer();
    await AuthService.logout();
    setUser(null);
    setToken(null);
    setAccessTokenExpiresAt(null);
    router.replace(reason === "inactivity" ? "/login?reason=inactive" : "/");
    endingSessionRef.current = false;
  }, [clearInactivityTimer, router]);

  useEffect(() => {
    if (!token) {
      clearInactivityTimer();
      return;
    }

    const scheduleInactivityLogout = () => {
      clearInactivityTimer();
      const remainingTime = Math.max(
        INACTIVITY_TIMEOUT_MS - (Date.now() - lastActivityAtRef.current),
        0,
      );
      inactivityTimerRef.current = window.setTimeout(() => {
        void logout("inactivity");
      }, remainingTime);
    };

    const registerActivity = () => {
      lastActivityAtRef.current = Date.now();
      scheduleInactivityLogout();
    };

    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, registerActivity, { passive: true }));
    scheduleInactivityLogout();

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, registerActivity));
      clearInactivityTimer();
    };
  }, [token, clearInactivityTimer, logout]);

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
