/** Última actividad real del usuario (compartida entre pestañas del mismo navegador). */
export const LAST_ACTIVITY_KEY = "auth:lastActivity";
/** Aviso a las demás pestañas de que la sesión se cerró (p. ej. por inactividad). */
export const LOGOUT_BROADCAST_KEY = "auth:logout";
/** Valor del parámetro ?reason= que muestra el mensaje en el login. */
export const INACTIVITY_REASON = "inactivity";
export const INACTIVITY_MESSAGE = "Sesión cerrada por inactividad";

export function readLastActivity(): number | null {
  try {
    const value = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function touchLastActivity(at: number = Date.now()): void {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(at));
  } catch {
    // almacenamiento no disponible: se usa solo la marca en memoria
  }
}
