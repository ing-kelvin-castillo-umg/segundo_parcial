"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
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

const IDLE_TIMEOUT_MS = 2 * 60 * 1000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = ["mousemove", "keydown", "scroll", "click"];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const idleLogoutInProgress = useRef(false);
  const router = useRouter();
  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));
  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleTokenRefreshed = (event: Event) => {
      const token = (event as CustomEvent<string>).detail;
      if (token) setToken(token);
    };

    const handleLogout = () => {
      setUser(null);
      setToken(null);
      router.push("/login");
    };

    window.addEventListener("auth:token-refreshed", handleTokenRefreshed);
    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const expireSession = async () => {
      if (!isMounted || idleLogoutInProgress.current) return;
      idleLogoutInProgress.current = true;
      setNotification("Sesión expirada por inactividad");

      try {
        await AuthService.logoutRemote();
      } finally {
        if (isMounted) {
          AuthService.logout();
          setUser(null);
          setToken(null);
          router.push("/login");
        }
        idleLogoutInProgress.current = false;
      }
    };

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        void expireSession();
      }, IDLE_TIMEOUT_MS);
    };

    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, resetTimer));
    resetTimer();

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [isAuthenticated, router]);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setNotification(null);
    setUser(session.user);
    setToken(session.token);
  };

  const logout = () => {
    void AuthService.logoutRemote();
    AuthService.logout();
    setUser(null);
    setToken(null);
    router.push("/");
  };

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
      {notification && (
        <div
          className="fixed right-4 top-4 z-50 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 shadow-lg"
          role="alert"
          aria-live="assertive"
        >
          {notification}
        </div>
      )}
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
