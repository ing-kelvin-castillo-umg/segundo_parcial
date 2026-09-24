"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [accessTokenExpiresAt, setAccessTokenExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        AuthService.logout();
        setUser(null);
        setToken(null);
        setAccessTokenExpiresAt(null);
        router.push("/login?reason=session-expired");
      }
    }, renewalDelay);

    return () => window.clearTimeout(timeout);
  }, [token, accessTokenExpiresAt, router]);

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
    setAccessTokenExpiresAt(null);
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
