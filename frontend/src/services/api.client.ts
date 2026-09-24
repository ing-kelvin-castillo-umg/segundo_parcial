import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";
import { AuthSession } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { SessionStore } from "./session.store";
import { SessionSync } from "./session.sync";

const LOGIN_ENDPOINT = "/api/auth/login";
const REFRESH_ENDPOINT = "/api/auth/refresh";
const LOGOUT_ENDPOINT = "/api/auth/logout";
const SESSION_EXPIRED_REDIRECT = "/login?reason=expired";

/** Endpoints cuyo 401 no debe disparar un refresh (evita bucles). */
const NO_REFRESH_ENDPOINTS = [LOGIN_ENDPOINT, REFRESH_ENDPOINT, LOGOUT_ENDPOINT];

export class ApiClient {
  /** Única promesa de refresh en vuelo (single-flight) compartida por todas las peticiones. */
  private static refreshPromise: Promise<AuthSession> | null = null;

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<ApiResponseDto<T>> {
    // Ruta relativa: la petición va al BFF de Next.js (/api/...), nunca directo al backend.
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const token = SessionStore.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && !isRetry && token && !this.isNoRefreshEndpoint(url)) {
        return await this.handleUnauthorized<T>(endpoint, options, token);
      }

      const data = await this.parseBody(response);

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return data as ApiResponseDto<T>;
    } catch (error: any) {
      console.error(`[API ERROR] ${options.method || "GET"} ${url}:`, error.message);
      throw error;
    }
  }

  static get<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static post<T>(endpoint: string, body: any): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static put<T>(endpoint: string, body: any): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static delete<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  /**
   * Renueva el access token usando la cookie httpOnly del refresh token.
   * Si ya hay un refresh en curso, devuelve esa misma promesa (single-flight).
   */
  static refreshSession(): Promise<AuthSession> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.doRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  private static async handleUnauthorized<T>(
    endpoint: string,
    options: RequestInit,
    tokenUsed: string
  ): Promise<ApiResponseDto<T>> {
    // Otra petición ya renovó el token mientras esta estaba en vuelo: solo reintentar.
    const currentToken = SessionStore.getToken();
    if (currentToken && currentToken !== tokenUsed) {
      return this.request<T>(endpoint, options, true);
    }

    console.warn("[Auth] Access token expirado (401), solicitando refresh...");

    try {
      await this.refreshSession();
    } catch (error: any) {
      console.error("[Auth] Refresh falló, redirigiendo a login:", error?.message);
      this.redirectToLogin();
      throw new Error("Tu sesión expiró, inicia sesión nuevamente");
    }

    return this.request<T>(endpoint, options, true);
  }

  private static async doRefresh(): Promise<AuthSession> {
    const response = await fetch(REFRESH_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });

    const data = (await this.parseBody(response)) as ApiResponseDto<AuthResponseDto> | null;

    if (!response.ok || !data?.success || !data.data?.accessToken) {
      throw new Error(data?.message || `Error HTTP ${response.status} al renovar la sesión`);
    }

    const session = AuthMapper.toSession(data.data);
    SessionStore.save(session);
    console.info(`[Auth] Nuevo access token obtenido, expira en ${data.data.expiresIn}s`);
    return session;
  }

  private static redirectToLogin(): void {
    // Se limpia el almacenamiento sin notificar a React: si AuthContext cambiara de estado,
    // el layout del dashboard redirigiría a /login y se perdería ?reason=expired.
    SessionStore.clear({ notify: false });
    SessionSync.clearActivity();
    if (typeof window !== "undefined") {
      window.location.replace(SESSION_EXPIRED_REDIRECT);
    }
  }

  private static isNoRefreshEndpoint(url: string): boolean {
    const path = url.split("?")[0];
    return NO_REFRESH_ENDPOINTS.includes(path);
  }

  private static async parseBody(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }
}
