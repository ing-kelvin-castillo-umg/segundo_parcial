import { AuthResponseDto } from "@/dtos/auth.dto";
import { AuthMapper } from "@/mappers/auth.mapper";

export const TOKEN_KEY = "token";
export const USER_KEY = "user";

/** Se emite cuando el access token se renovó correctamente. */
export const TOKEN_REFRESHED_EVENT = "auth:token-refreshed";
/** Se emite cuando la sesión terminó porque el refresh token venció, fue revocado o es inválido. */
export const SESSION_CLEARED_EVENT = "auth:session-cleared";

/** Margen máximo de renovación anticipada, para no enviar solicitudes con un token a punto de expirar. */
const EXPIRY_SKEW_MS = 15_000;
const LOCK_NAME = "auth-refresh";

export type RefreshResult = "refreshed" | "expired" | "error";

export class TokenManager {
  /** Renovación en curso en esta pestaña: las solicitudes simultáneas comparten una sola. */
  private static inFlight: Promise<RefreshResult> | null = null;

  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Lee `iat` y `exp` del JWT. Solo informativo: la validación real la hace el backend. */
  private static getTimes(token: string): { issuedMs: number; expiryMs: number } | null {
    try {
      const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const { iat, exp } = JSON.parse(atob(payload));
      return typeof iat === "number" && typeof exp === "number" ? { issuedMs: iat * 1000, expiryMs: exp * 1000 } : null;
    } catch {
      return null;
    }
  }

  /**
   * true si el token ya venció o vencerá en unos segundos. El margen es proporcional a la vida del token
   * (máx. 15 s o el 20 %), para que un token de vida corta no se considere vencido desde que nace.
   */
  static isExpiring(token: string): boolean {
    const times = this.getTimes(token);
    if (!times) return false;
    const skew = Math.min(EXPIRY_SKEW_MS, (times.expiryMs - times.issuedMs) * 0.2);
    return times.expiryMs - skew <= Date.now();
  }

  /** Elimina la sesión local y avisa a la interfaz (el dashboard redirige al login). */
  static clearSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event(SESSION_CLEARED_EVENT));
  }

  /**
   * Renueva el access token usando el refresh token (cookie httpOnly gestionada por el BFF).
   * @param staleToken el access token con el que falló o iba a enviarse la solicitud
   */
  static refresh(staleToken: string): Promise<RefreshResult> {
    if (!this.inFlight) {
      this.inFlight = this.refreshExclusive(staleToken).finally(() => {
        this.inFlight = null;
      });
    }
    return this.inFlight;
  }

  // Web Locks: serializa la renovación entre pestañas. Como el refresh token rota en cada uso,
  // dos pestañas renovando a la vez invalidarían la sesión una a la otra.
  private static async refreshExclusive(staleToken: string): Promise<RefreshResult> {
    const work = async (): Promise<RefreshResult> => {
      const current = this.getToken();
      if (!current) return "expired"; // la sesión se cerró en otra pestaña
      if (current !== staleToken && !this.isExpiring(current)) return "refreshed"; // otra pestaña ya renovó
      return this.callRefreshEndpoint();
    };
    if (typeof navigator !== "undefined" && navigator.locks) {
      return await navigator.locks.request(LOCK_NAME, work);
    }
    return work();
  }

  private static async callRefreshEndpoint(): Promise<RefreshResult> {
    let response: Response;
    try {
      response = await fetch("/api/auth/refresh", { method: "POST", headers: { Accept: "application/json" }, cache: "no-store" });
    } catch {
      return "error"; // sin red: se conserva la sesión y se puede reintentar
    }

    if (response.status === 401) {
      this.clearSession();
      return "expired";
    }
    if (!response.ok) return "error";

    // Si mientras tanto se cerró la sesión (logout, inactividad u otra pestaña), la respuesta tardía se descarta.
    if (!this.getToken()) return "expired";

    try {
      const body = await response.json();
      const session = AuthMapper.toSession(body.data as AuthResponseDto);
      localStorage.setItem(TOKEN_KEY, session.token);
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
      window.dispatchEvent(new CustomEvent(TOKEN_REFRESHED_EVENT, { detail: session }));
      return "refreshed";
    } catch {
      return "error";
    }
  }
}
