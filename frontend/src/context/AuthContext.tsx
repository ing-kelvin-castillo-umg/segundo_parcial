"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { ApiClient } from "@/services/api.client";
import {
  INACTIVITY_EVENT_THROTTLE_MS,
  INACTIVITY_TIMEOUT_MS,
  INACTIVITY_WARNING_MS,
} from "@/config/session";

type LogoutReason = "manual" | "inactivity" | "expired";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  remainingSeconds: number;
  isInactivityWarning: boolean;
  logoutReason: LogoutReason | null;
  login: (username: string, password: string) => Promise<void>;
  logout: (reason?: LogoutReason) => Promise<void>;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(INACTIVITY_TIMEOUT_MS / 1000);
  const [isInactivityWarning, setIsInactivityWarning] = useState(false);
  const [logoutReason, setLogoutReason] = useState<LogoutReason | null>(null);
  const deadlineRef = useRef(0);
  const lastActivityRef = useRef(0);
  const logoutInProgressRef = useRef(false);
  const router = useRouter();

  const isAuthenticated = !!token && !!user;
  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));

  const logout = useCallback(async (reason: LogoutReason = "manual") => {
    if (logoutInProgressRef.current) return;
    logoutInProgressRef.current = true;

    try {
      if (reason === "expired") {
        AuthService.clearStoredSession();
      } else {
        await AuthService.logout();
      }
    } finally {
      setLogoutReason(reason);
      setUser(null);
      setToken(null);
      setIsInactivityWarning(false);
      setRemainingSeconds(0);
      logoutInProgressRef.current = false;

      router.replace(reason === "inactivity" ? "/login?reason=inactivity" : "/login");
    }
  }, [router]);

  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticated) return;

    deadlineRef.current = Date.now() + INACTIVITY_TIMEOUT_MS;
    lastActivityRef.current = Date.now();
    setRemainingSeconds(INACTIVITY_TIMEOUT_MS / 1000);
    setIsInactivityWarning(false);
  }, [isAuthenticated]);

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
      ApiClient.resetSessionExpiration();
      AuthService.getCurrentUser()
        .then((currentUser) => {
          setUser(currentUser);
          setToken(localStorage.getItem("token"));
        })
        .catch(() => {
          // ApiClient renews the token or ends an expired session.
        });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    ApiClient.setSessionExpiredHandler(() => {
      void logout("expired");
    });

    return () => ApiClient.setSessionExpiredHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      deadlineRef.current = 0;
      setIsInactivityWarning(false);
      return;
    }

    resetInactivityTimer();

    const updateRemainingTime = () => {
      const millisecondsRemaining = deadlineRef.current - Date.now();
      const secondsRemaining = Math.max(0, Math.ceil(millisecondsRemaining / 1000));

      setRemainingSeconds((current) => current === secondsRemaining ? current : secondsRemaining);
      setIsInactivityWarning(secondsRemaining > 0 && secondsRemaining * 1000 <= INACTIVITY_WARNING_MS);

      if (millisecondsRemaining <= 0) {
        void logout("inactivity");
      }
    };

    const recordActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current < INACTIVITY_EVENT_THROTTLE_MS) return;
      resetInactivityTimer();
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove", "mousedown", "click", "keydown", "scroll", "touchstart", "pointerdown",
    ];
    events.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }));

    const intervalId = window.setInterval(updateRemainingTime, 250);
    return () => {
      window.clearInterval(intervalId);
      events.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
    };
  }, [isAuthenticated, logout, resetInactivityTimer]);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setLogoutReason(null);
    setUser(session.user);
    setToken(session.token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        remainingSeconds,
        isInactivityWarning,
        logoutReason,
        login,
        logout,
        resetInactivityTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
