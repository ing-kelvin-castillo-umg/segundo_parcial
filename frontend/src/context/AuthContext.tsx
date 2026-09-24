"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { ApiClient } from "@/services/api.client";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  idleSecondsRemaining: number;
  login: (username: string, password: string) => Promise<void>;
  logout: (reason?: "manual" | "idle") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const logoutInProgress = useRef(false);

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);

    const onTokenRefreshed = (event: Event) => {
      setToken((event as CustomEvent<string>).detail);
    };
    window.addEventListener("auth:token-refreshed", onTokenRefreshed);
    return () => window.removeEventListener("auth:token-refreshed", onTokenRefreshed);
  }, []);

  useEffect(() => {
    if (!token) return;
    const expiresAt = Number(localStorage.getItem("accessTokenExpiresAt"));
    if (!expiresAt) return;

    // Refresh shortly before expiry; the API client also handles a missed timer via 401.
    const delay = Math.max(0, expiresAt - Date.now() - 15_000);
    const timeout = window.setTimeout(() => {
      void ApiClient.refreshAccessToken().catch(() => {
        // The API client redirects to login when renewal is no longer possible.
      });
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [token]);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.token);
  };

  const logout = async (reason: "manual" | "idle" = "manual") => {
    if (logoutInProgress.current) return;
    logoutInProgress.current = true;
    try {
      await AuthService.logout();
    } catch {
      // Local session cleanup is guaranteed by AuthService.logout().
    } finally {
      window.location.replace(reason === "idle" ? "/login?reason=idle" : "/login");
    }
  };

  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));
  const isAuthenticated = !!token && !!user;
  const idleSecondsRemaining = useIdleTimeout(isAuthenticated, () => {
    void logout("idle");
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        idleSecondsRemaining,
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
