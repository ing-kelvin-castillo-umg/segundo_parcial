"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Política de inactividad (configurable en build con NEXT_PUBLIC_IDLE_TIMEOUT_MS / NEXT_PUBLIC_IDLE_WARNING_MS):
 * - Tras IDLE_TIMEOUT_MS sin interacción del usuario la sesión se cierra (logout en backend vía BFF).
 * - IDLE_WARNING_MS antes del cierre se muestra una advertencia con cuenta regresiva.
 * Solo cuentan los eventos del usuario (mouse, teclado, scroll, toques). El refresco automático del
 * token (peticiones HTTP) NO es actividad: un usuario inactivo es desconectado aunque el token sea renovable.
 */
export const IDLE_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS) || 2 * 60 * 1000;
export const IDLE_WARNING_MS = Number(process.env.NEXT_PUBLIC_IDLE_WARNING_MS) || 30 * 1000;

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "click", "keydown", "scroll", "wheel", "touchstart"] as const;

interface UseIdleTimerOptions {
  onIdle: () => void;
  enabled?: boolean;
  timeoutMs?: number;
  warningMs?: number;
}

export function useIdleTimer({
  onIdle,
  enabled = true,
  timeoutMs = IDLE_TIMEOUT_MS,
  warningMs = IDLE_WARNING_MS,
}: UseIdleTimerOptions) {
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);
  const firedRef = useRef(false);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  // Milisegundos restantes mientras se muestra la advertencia; null si no hay advertencia.
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  const registerActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (warningShownRef.current) {
      warningShownRef.current = false;
      setRemainingMs(null);
      console.log("[IDLE] 👋 Actividad del usuario detectada: temporizador de inactividad reiniciado");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    firedRef.current = false;
    warningShownRef.current = false;
    lastActivityRef.current = Date.now();
    console.log(
      `[IDLE] 👀 Detector de inactividad activo: advertencia a los ${(timeoutMs - warningMs) / 1000}s y cierre de sesión a los ${
        timeoutMs / 1000
      }s sin actividad`
    );

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, registerActivity, { passive: true }));

    // Se compara contra la hora real (no se cuentan ticks), así funciona aunque el navegador ralentice la pestaña.
    const interval = setInterval(() => {
      if (firedRef.current) return;
      const idleMs = Date.now() - lastActivityRef.current;

      if (idleMs >= timeoutMs) {
        firedRef.current = true;
        setRemainingMs(null);
        console.warn(
          `[IDLE] 🚪 Inactividad detectada a las ${new Date().toLocaleTimeString()}: ${Math.round(
            idleMs / 1000
          )}s sin actividad → cerrando sesión`
        );
        onIdleRef.current();
      } else if (idleMs >= timeoutMs - warningMs) {
        if (!warningShownRef.current) {
          warningShownRef.current = true;
          console.warn(
            `[IDLE] ⏳ ${Math.round(idleMs / 1000)}s sin actividad: la sesión se cerrará en ${Math.round(
              (timeoutMs - idleMs) / 1000
            )}s`
          );
        }
        setRemainingMs(timeoutMs - idleMs);
      }
    }, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, registerActivity));
      clearInterval(interval);
    };
  }, [enabled, timeoutMs, warningMs, registerActivity]);

  return { remainingMs, stayActive: registerActivity };
}
