"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useIdleTimer } from "@/hooks/useIdleTimer";

const IDLE_TIMEOUT_MS = 120000; // 2 minutos, mismo tiempo que el access token para poder demostrarlo en la evidencia

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: (reason?: "inactivity" | "manual") => Promise<void>;
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

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.token);
  };

  const logout = async (reason: "inactivity" | "manual" = "manual") => {
    console.log("[AUTH] logout ejecutado con reason=", reason);
    await AuthService.logout();
    setUser(null);
    setToken(null);
    if (reason === "inactivity") {
      router.push("/login?reason=inactivity");
    } else {
      router.push("/");
    }
  };

  const isAuthenticatedForIdle = !!token && !!user;

  useIdleTimer(
    IDLE_TIMEOUT_MS,
    () => {
      logout("inactivity");
    },
    isAuthenticatedForIdle && !loading
  );

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
