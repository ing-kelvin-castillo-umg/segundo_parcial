"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { ApiClient } from "@/services/api.client";
import { useRouter } from "next/navigation";

const REFRESH_ADVANCE_MS = 30_000;

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
  logout: () => void;
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
      AuthService.logout();
      setUser(null);
      setToken(null);
      router.push("/login?reason=session-expired");
    }
  }, [token, router]);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.token);
  };

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
