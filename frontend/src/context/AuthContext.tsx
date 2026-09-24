"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { LogoutReason, User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { usePathname, useRouter } from "next/navigation";

/** Destino tras cerrar sesión según el motivo. */
const LOGOUT_REDIRECTS: Record<LogoutReason, string> = {
  MANUAL: "/",
  INACTIVITY: "/login?reason=inactividad",
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  /**
   * Destino de un logout en curso. El layout privado lo usa en lugar de "/login" para no
   * pisar la redirección (y su ?reason=) cuando el estado de sesión se limpia.
   */
  logoutRedirect: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: (reason?: LogoutReason) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutRedirect, setLogoutRedirect] = useState<string | null>(null);
  const loggingOutRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  /** Resetea el estado del contexto y navega al destino correspondiente al motivo. */
  const finishLogout = useCallback(
    (reason: LogoutReason) => {
      const target = LOGOUT_REDIRECTS[reason] ?? "/";
      setLogoutRedirect(target);
      setUser(null);
      setToken(null);
      router.replace(target);
    },
    [router]
  );

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);

    // El interceptor de ApiClient renueva el token en segundo plano; aquí se refleja en el estado.
    const unsubscribeSession = AuthService.subscribe((updated) => {
      setUser(updated?.user ?? null);
      setToken(updated?.token ?? null);
    });

    // Logout hecho en otra pestaña: el servidor ya fue notificado, solo se cierra localmente.
    const unsubscribeRemote = AuthService.onRemoteLogout((reason) => {
      console.info(`[Auth] Sesión cerrada en otra pestaña [${reason}]`);
      AuthService.clearLocalSession();
      finishLogout(reason);
    });

    return () => {
      unsubscribeSession();
      unsubscribeRemote();
    };
  }, [finishLogout]);

  // Una vez que se llegó al destino del logout, se olvida la redirección pendiente.
  useEffect(() => {
    if (logoutRedirect && pathname === logoutRedirect.split("?")[0]) {
      setLogoutRedirect(null);
    }
  }, [pathname, logoutRedirect]);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setLogoutRedirect(null);
    setUser(session.user);
    setToken(session.token);
  };

  /** Único punto de cierre de sesión (manual e inactividad). */
  const logout = useCallback(
    async (reason: LogoutReason = "MANUAL") => {
      if (loggingOutRef.current) return;
      loggingOutRef.current = true;
      try {
        await AuthService.logout(reason);
      } finally {
        finishLogout(reason);
        loggingOutRef.current = false;
      }
    },
    [finishLogout]
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
        logoutRedirect,
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
