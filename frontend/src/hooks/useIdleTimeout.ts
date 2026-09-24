"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseIdleTimeoutOptions {
  /** Tiempo de inactividad permitido antes de cerrar la sesión. */
  timeoutMs: number;
  /** Antelación con la que se muestra el aviso previo al cierre. */
  warningMs: number;
  /** Se ejecuta al agotarse el tiempo de inactividad. */
  onTimeout: () => void;
  /** Desactiva el detector (por ejemplo, mientras no haya sesión). */
  enabled?: boolean;
}

interface UseIdleTimeoutResult {
  /** Milisegundos restantes antes del cierre automático. */
  remainingMs: number;
  /** Indica si ya se entró en la ventana de aviso. */
  isWarning: boolean;
  /** Registra actividad manualmente (botón "Seguir conectado"). */
  reset: () => void;
}

/** Eventos que se consideran señal de actividad del usuario. */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "click",
  "scroll",
  "touchstart",
  "wheel",
];

/** Frecuencia máxima con la que se reinicia el contador ante actividad continua. */
const ACTIVITY_THROTTLE_MS = 1000;

/**
 * Detecta la inactividad del usuario y expone el tiempo restante para poder
 * mostrar un temporizador en pantalla.
 */
export function useIdleTimeout({
  timeoutMs,
  warningMs,
  onTimeout,
  enabled = true,
}: UseIdleTimeoutOptions): UseIdleTimeoutResult {
  const [remainingMs, setRemainingMs] = useState(timeoutMs);

  const lastActivityRef = useRef<number>(Date.now());
  const lastResetRef = useRef<number>(0);
  const firedRef = useRef<boolean>(false);
  const onTimeoutRef = useRef(onTimeout);

  // Se guarda en una referencia para que cambiar el callback no reinicie el ciclo.
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const reset = useCallback(() => {
    lastActivityRef.current = Date.now();
    lastResetRef.current = Date.now();
    firedRef.current = false;
    setRemainingMs(timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    lastActivityRef.current = Date.now();
    lastResetRef.current = Date.now();
    firedRef.current = false;
    setRemainingMs(timeoutMs);

    const registerActivity = () => {
      const now = Date.now();
      // Sin este límite, cada píxel de movimiento del ratón forzaría un render.
      if (now - lastResetRef.current < ACTIVITY_THROTTLE_MS) {
        return;
      }
      lastResetRef.current = now;
      lastActivityRef.current = now;
      firedRef.current = false;
      setRemainingMs(timeoutMs);
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, registerActivity, { passive: true })
    );

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const left = Math.max(0, timeoutMs - elapsed);
      setRemainingMs(left);

      if (left === 0 && !firedRef.current) {
        firedRef.current = true;
        onTimeoutRef.current();
      }
    }, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, registerActivity));
      window.clearInterval(interval);
    };
  }, [enabled, timeoutMs]);

  return {
    remainingMs,
    isWarning: enabled && remainingMs <= warningMs,
    reset,
  };
}
