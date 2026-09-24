"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: (reason?: "manual" | "inactivity") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

  const logout = useCallback(async (reason: "manual" | "inactivity" = "manual") => {
    await AuthService.logout();
    setUser(null);
    setToken(null);
    window.location.assign(reason === "inactivity" ? "/login?reason=inactive" : "/");
  }, []);

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
