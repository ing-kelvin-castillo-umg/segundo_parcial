"use client";

import { useEffect, useRef } from "react";
import { readLastActivity, touchLastActivity } from "@/services/idle.storage";

// Solo interacciones reales del usuario. Las solicitudes automáticas (fetch, renovación de token) no cuentan.
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "click", "keydown", "scroll", "wheel", "touchstart", "touchmove"] as const;
const ACTIVITY_THROTTLE_MS = 1000;

/**
 * Detecta inactividad del usuario. Basado en marcas de tiempo (no en contadores), por lo que sigue siendo
 * correcto si el navegador pausa los temporizadores de una pestaña oculta o el equipo se suspende.
 * La última actividad se comparte por localStorage: actividad en cualquier pestaña mantiene viva la sesión.
 */
export function useIdleTimer(enabled: boolean, timeoutMs: number, onIdle: () => void) {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!enabled) return;

    let localLast = Date.now();
    let fired = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const lastActivity = () => Math.max(localLast, readLastActivity() ?? 0);

    const fire = () => {
      if (fired) return;
      fired = true;
      console.info(`[Inactividad] ${Math.round(timeoutMs / 1000)} s sin actividad: cerrando sesión`);
      onIdleRef.current();
    };

    const check = () => {
      if (Date.now() - lastActivity() >= timeoutMs) fire();
      else schedule();
    };

    const schedule = () => {
      if (timer) clearTimeout(timer);
      const remaining = timeoutMs - (Date.now() - lastActivity());
      timer = setTimeout(check, Math.max(remaining, 0) + 50);
    };

    const onActivity = (event: Event) => {
      if (!event.isTrusted) return; // ignora eventos sintéticos disparados por código
      const now = Date.now();
      if (now - localLast < ACTIVITY_THROTTLE_MS) return;
      if (now - localLast > 10_000) console.info("[Inactividad] Actividad detectada: temporizador reiniciado");
      localLast = now;
      touchLastActivity(now);
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };

    console.info(`[Inactividad] Temporizador iniciado: ${Math.round(timeoutMs / 1000)} s`);
    // Sesión restaurada tras un tiempo sin uso (p. ej. navegador cerrado): se evalúa de inmediato.
    if (readLastActivity() === null) touchLastActivity(localLast);
    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, onActivity, { capture: true, passive: true }));
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    check();

    return () => {
      if (timer) clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity, { capture: true }));
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [enabled, timeoutMs]);
}
