import { AuthSession, User } from "@/entities/user.entity";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const EXPIRES_AT_KEY = "tokenExpiresAt";

type SessionListener = (session: AuthSession | null) => void;

/**
 * Almacenamiento de la sesión del navegador (access token + usuario).
 * Lo comparten AuthService, el interceptor de ApiClient y AuthContext, que se suscribe
 * para enterarse cuando el interceptor renueva el token.
 */
export class SessionStore {
  private static listeners = new Set<SessionListener>();

  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  static getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(TOKEN_KEY) : null;
  }

  static getSession(): AuthSession | null {
    if (!this.isBrowser()) return null;

    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    if (!token || !userStr) return null;

    try {
      const user = JSON.parse(userStr) as User;
      return {
        token,
        expiresAt: Number(localStorage.getItem(EXPIRES_AT_KEY)) || 0,
        user,
        isAuthenticated: true,
        isAdmin: user.roles?.includes("ROLE_ADMIN") || false,
      };
    } catch {
      return null;
    }
  }

  static save(session: AuthSession): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    localStorage.setItem(EXPIRES_AT_KEY, String(session.expiresAt));
    this.notify(session);
  }

  static clear(options: { notify?: boolean } = {}): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    if (options.notify !== false) this.notify(null);
  }

  static subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify(session: AuthSession | null): void {
    this.listeners.forEach((listener) => listener(session));
  }
}
