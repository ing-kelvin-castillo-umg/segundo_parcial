"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { SESSION_CLEARED_EVENT, TOKEN_KEY, TOKEN_REFRESHED_EVENT } from "@/services/token.manager";
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
