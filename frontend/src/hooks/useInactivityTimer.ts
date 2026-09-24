"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SessionSync } from "@/services/session.sync";

/** Solo eventos generados por el usuario; las peticiones automáticas (refresh, etc.) no cuentan. */
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "click", "scroll", "wheel", "touchstart"] as const;

/** Como máximo se registra una actividad por segundo. */
const ACTIVITY_THROTTLE_MS = 1000;
/** Frecuencia con la que se recalcula el tiempo restante. */
const TICK_MS = 500;

interface UseInactivityTimerOptions {
  /** Tiempo sin actividad tras el cual se dispara onTimeout. */
  timeoutMs: number;
  /** Cuánto antes del límite se considera "zona de advertencia". */
  warningMs: number;
  onTimeout: () => void;
  enabled?: boolean;
}

interface UseInactivityTimerResult {
  /** Milisegundos que quedan antes del cierre por inactividad. */
  remainingMs: number;
  /** true durante los últimos warningMs. */
  isWarning: boolean;
  /** Registra actividad explícita (ej. botón "Seguir conectado"). */
  keepAlive: () => void;
}

/**
 * Temporizador de inactividad sincronizado entre pestañas: la última actividad se guarda en
 * localStorage, por lo que la actividad en cualquier pestaña mantiene viva la sesión en todas.
 *
 * Durante la zona de advertencia los eventos pasivos (mover el mouse, scroll...) se ignoran:
 * el usuario debe confirmar explícitamente con keepAlive().
 */
export function useInactivityTimer({
  timeoutMs,
  warningMs,
  onTimeout,
  enabled = true,
}: UseInactivityTimerOptions): UseInactivityTimerResult {
  const [remainingMs, setRemainingMs] = useState(timeoutMs);

  const onTimeoutRef = useRef(onTimeout);
  const isWarningRef = useRef(false);
  const firedRef = useRef(false);
  const lastRecordedRef = useRef(0);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const recordActivity = useCallback(
    (force: boolean) => {
      const now = Date.now();
      const last = SessionSync.getLastActivity() ?? now;

      // Si el límite ya pasó (ej. pestaña en segundo plano), no se revive la sesión.
      if (now - last >= timeoutMs || firedRef.current) return;
      if (!force && (isWarningRef.current || now - lastRecordedRef.current < ACTIVITY_THROTTLE_MS)) return;

      lastRecordedRef.current = now;
      SessionSync.markActivity(now);
      isWarningRef.current = false;
      setRemainingMs(timeoutMs);
    },
    [timeoutMs]
  );

  const keepAlive = useCallback(() => recordActivity(true), [recordActivity]);

  useEffect(() => {
    if (!enabled) return;

    firedRef.current = false;
    // Sin registro previo (primera carga) se empieza a contar desde ahora; si hay uno, se respeta
    // para que recargar la página o abrir otra pestaña no reinicie un temporizador ya vencido.
    if (SessionSync.getLastActivity() === null) {
      SessionSync.markActivity();
    }

    const onActivity = () => recordActivity(false);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") recordActivity(false);
    };

    const tick = () => {
      const last = SessionSync.getLastActivity() ?? Date.now();
      const remaining = Math.max(0, last + timeoutMs - Date.now());
      isWarningRef.current = remaining <= warningMs;
      setRemainingMs(remaining);

      if (remaining === 0 && !firedRef.current) {
        firedRef.current = true;
        onTimeoutRef.current();
      }
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true, capture: true })
    );
    document.addEventListener("visibilitychange", onVisibilityChange);

    tick();
    const interval = window.setInterval(tick, TICK_MS);

    return () => {
      window.clearInterval(interval);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, onActivity, { capture: true })
      );
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, timeoutMs, warningMs, recordActivity]);

  return {
    remainingMs,
    isWarning: enabled && remainingMs <= warningMs,
    keepAlive,
  };
}
