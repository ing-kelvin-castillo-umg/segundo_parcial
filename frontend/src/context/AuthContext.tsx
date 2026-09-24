"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { SESSION_EXPIRED_EVENT } from "@/services/api.client";
import { useRouter } from "next/navigation";

// Motivo por el que terminó la sesión; el layout privado lo pasa a /login?reason=...
export type SessionEndReason = "expired";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  sessionEndReason: SessionEndReason | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionEndReason, setSessionEndReason] = useState<SessionEndReason | null>(null);
  const router = useRouter();

  // Al cargar: si había sesión, se valida contra el servidor (/api/auth/me). Si el access token
  // ya expiró, ApiClient lo renueva automáticamente con el refresh token antes de responder.
  useEffect(() => {
    const storedUser = AuthService.getStoredUser();
    if (!storedUser) {
      setLoading(false);
      return;
    }

    setUser(storedUser);
    AuthService.getCurrentUser()
      .then((currentUser) => setUser(currentUser))
      .catch(() => {
        AuthService.clearLocalSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // El refresh token expiró o fue revocado: se limpia la sesión local.
  useEffect(() => {
    const handleSessionExpired = () => {
      console.warn("[AUTH] Sesión expirada: no fue posible renovar el token");
      AuthService.clearLocalSession();
      setSessionEndReason("expired");
      setUser(null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setSessionEndReason(null);
    setUser(session.user);
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // Aunque el BFF no responda, la sesión local se limpia igualmente.
    }
    setUser(null);
    router.push("/");
  };

  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        loading,
        sessionEndReason,
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
