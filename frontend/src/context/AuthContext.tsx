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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);

    const handleExpired = () => {
      setUser(null);
      setToken(null);
      router.push("/login?reason=expired");
    };
    window.addEventListener("auth:session-expired", handleExpired);
    return () => window.removeEventListener("auth:session-expired", handleExpired);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    let timeoutId: number;
    const resetInactivityTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(async () => {
        await AuthService.logout();
        setUser(null);
        setToken(null);
        router.push("/login?reason=inactivity");
      }, 3 * 60 * 1000);
    };
    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    activityEvents.forEach((event) => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
    };
  }, [router, token]);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.token);
  };

  const logout = () => {
    void AuthService.logout();
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
