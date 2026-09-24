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
  logout: (reason?: "inactivity") => Promise<void>;
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
    if (!token) return;
    const timeoutMs = 3 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void logout("inactivity"), timeoutMs);
    };
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [token]);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.token);
  };

  const logout = async (reason?: "inactivity") => {
    await AuthService.logout();
    setUser(null);
    setToken(null);
    if (reason === "inactivity") sessionStorage.setItem("logoutMessage", "Sesión cerrada por inactividad");
    router.push(reason === "inactivity" ? "/login" : "/");
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
