import { LogoutReason } from "@/entities/user.entity";

const CHANNEL_NAME = "auth-session";
const LAST_ACTIVITY_KEY = "lastActivityAt";
/** Clave usada como respaldo (evento storage) si el navegador no soporta BroadcastChannel. */
const LOGOUT_SIGNAL_KEY = "auth:logout";

type SyncMessage = { type: "logout"; reason: LogoutReason };

/**
 * Sincronización de sesión entre pestañas.
 * - Última actividad: se guarda en localStorage, así todas las pestañas leen el mismo reloj.
 * - Logout: se difunde por BroadcastChannel (o evento storage como respaldo) para cerrar todas.
 */
export class SessionSync {
  private static channel: BroadcastChannel | null = null;

  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  private static getChannel(): BroadcastChannel | null {
    if (!this.isBrowser() || typeof BroadcastChannel === "undefined") return null;
    if (!this.channel) this.channel = new BroadcastChannel(CHANNEL_NAME);
    return this.channel;
  }

  static markActivity(at: number = Date.now()): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(LAST_ACTIVITY_KEY, String(at));
  }

  static getLastActivity(): number | null {
    if (!this.isBrowser()) return null;
    const value = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  static clearActivity(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  }

  /** Avisa a las demás pestañas que la sesión se cerró. */
  static broadcastLogout(reason: LogoutReason): void {
    if (!this.isBrowser()) return;
    const channel = this.getChannel();
    if (channel) {
      channel.postMessage({ type: "logout", reason } satisfies SyncMessage);
    } else {
      localStorage.setItem(LOGOUT_SIGNAL_KEY, JSON.stringify({ reason, at: Date.now() }));
      localStorage.removeItem(LOGOUT_SIGNAL_KEY);
    }
  }

  /** Escucha logouts hechos en otras pestañas. Devuelve la función para dejar de escuchar. */
  static onRemoteLogout(listener: (reason: LogoutReason) => void): () => void {
    if (!this.isBrowser()) return () => {};

    const channel = this.getChannel();
    if (channel) {
      const onMessage = (event: MessageEvent<SyncMessage>) => {
        if (event.data?.type === "logout") listener(event.data.reason);
      };
      channel.addEventListener("message", onMessage);
      return () => channel.removeEventListener("message", onMessage);
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== LOGOUT_SIGNAL_KEY || !event.newValue) return;
      try {
        listener(JSON.parse(event.newValue).reason as LogoutReason);
      } catch {
        listener("MANUAL");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }
}
