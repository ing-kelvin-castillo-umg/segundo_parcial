import { ApiResponseDto } from "@/dtos/auth.dto";
import { getTimeToExpiry } from "@/lib/token";

/**
 * Todas las peticiones del navegador viajan a rutas relativas de Next.js
 * (/api/...). Son los Route Handlers quienes reenvían al backend, de modo que la
 * dirección real del servicio nunca se expone al cliente.
 */
const API_BASE_URL = "";

/** Margen con el que se renueva el token antes de que expire realmente. */
const REFRESH_THRESHOLD_MS = 30_000;

/** Error de API que conserva el código HTTP original devuelto por la pasarela. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Renovación en vuelo compartida: si varias peticiones detectan a la vez que el
 * token caducó, todas esperan la misma llamada a /api/auth/refresh en lugar de
 * disparar una renovación por cada una.
 */
let refreshInFlight: Promise<string | null> | null = null;

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  /**
   * Pide un access token nuevo. El refresh token no se envía: viaja solo en la
   * cookie httpOnly que el Route Handler adjunta del lado del servidor.
   */
  private static async refreshAccessToken(): Promise<string | null> {
    if (refreshInFlight) {
      return refreshInFlight;
    }

    refreshInFlight = (async () => {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { Accept: "application/json" },
          credentials: "same-origin",
        });

        if (!response.ok) {
          return null;
        }

        const body = await response.json();
        const newToken: string | undefined = body?.data?.token;

        if (!newToken) {
          return null;
        }

        localStorage.setItem("token", newToken);
        console.info("[AUTH] Token de acceso renovado de forma transparente");
        return newToken;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();

    return refreshInFlight;
  }

  /** Cierra la sesión local y devuelve al usuario al inicio de sesión. */
  private static forceReLogin(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login?reason=expired";
  }

  private static async execute(url: string, options: RequestInit, token: string | null): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers, credentials: "same-origin" });
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponseDto<T>> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    let token = this.getToken();

    // Renovación proactiva: si al token le queda poca vigencia se renueva antes
    // de enviar la petición, con lo que el usuario nunca percibe un corte.
    if (token && getTimeToExpiry(token) < REFRESH_THRESHOLD_MS) {
      const renewed = await this.refreshAccessToken();
      if (renewed) {
        token = renewed;
      }
    }

    try {
      let response = await this.execute(url, options, token);

      // Renovación reactiva: el backend rechazó el token, se intenta una única
      // renovación y se repite la petición original.
      if (response.status === 401 && token) {
        const renewed = await this.refreshAccessToken();

        if (!renewed) {
          this.forceReLogin();
          throw new ApiError("La sesión expiró. Inicia sesión nuevamente.", 401);
        }

        response = await this.execute(url, options, renewed);
      }

      // Las respuestas 204 y las que llegan sin cuerpo no se pueden parsear.
      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : null;

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new ApiError(errorMsg, response.status);
      }

      return (data ?? { success: true, message: "", data: null }) as ApiResponseDto<T>;
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
}
