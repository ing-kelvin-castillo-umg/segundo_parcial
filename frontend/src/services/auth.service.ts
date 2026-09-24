import { AuthResponseDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, LogoutReason, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";
import { SessionStore } from "./session.store";
import { SessionSync } from "./session.sync";

const LOGOUT_ENDPOINT = "/api/auth/logout";

/** Claves de sessionStorage asociadas a la sesión (hoy la app no guarda nada ahí, se limpian por si acaso). */
const SESSION_STORAGE_KEYS = ["token", "user", "tokenExpiresAt"];

export class AuthService {
  static async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const dto = AuthMapper.toLoginDto(credentials);
    const response = await ApiClient.post<AuthResponseDto>("/api/auth/login", dto);
    const session = AuthMapper.toSession(response.data);

    SessionStore.save(session);
    // El login cuenta como actividad: el temporizador de inactividad arranca desde cero.
    SessionSync.markActivity();
    console.info(`[Auth] Sesión iniciada, access token expira en ${response.data.expiresIn}s`);

    return session;
  }

  /** Renueva el access token con el refresh token de la cookie httpOnly (single-flight). */
  static refresh(): Promise<AuthSession> {
    return ApiClient.refreshSession();
  }

  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/api/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }

  /**
   * Cierre de sesión centralizado: avisa al BFF (que revoca en el backend y borra la cookie),
   * limpia el almacenamiento local y notifica a las demás pestañas.
   * Nunca lanza error: aunque la red falle, el navegador queda deslogueado.
   */
  static async logout(reason: LogoutReason = "MANUAL"): Promise<void> {
    const token = SessionStore.getToken();

    try {
      await fetch(LOGOUT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason }),
        credentials: "same-origin",
        // Permite que la petición termine aunque la página navegue o se cierre.
        keepalive: true,
      });
    } catch (error: any) {
      console.warn(`[Auth] No se pudo notificar el logout [${reason}] al servidor:`, error?.message);
    }

    this.clearLocalSession();
    SessionSync.broadcastLogout(reason);
    console.info(`[Auth] Sesión cerrada [${reason}]`);
  }

  /** Limpia todo rastro de la sesión en el navegador (sin llamar al servidor). */
  static clearLocalSession(): void {
    SessionStore.clear({ notify: false });
    SessionSync.clearActivity();
    if (typeof window !== "undefined") {
      SESSION_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));
    }
  }

  static onRemoteLogout(listener: (reason: LogoutReason) => void): () => void {
    return SessionSync.onRemoteLogout(listener);
  }

  static getStoredSession(): AuthSession | null {
    return SessionStore.getSession();
  }

  static subscribe(listener: (session: AuthSession | null) => void): () => void {
    return SessionStore.subscribe(listener);
  }
}
