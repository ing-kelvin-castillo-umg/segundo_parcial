"use client";

import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

export function useIdleTimer(timeoutMs: number, onIdle: () => void, enabled: boolean) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      console.log("[IDLE] timer armado, enabled=", enabled, "timeoutMs=", timeoutMs);
      timeoutRef.current = setTimeout(() => {
        console.log("[IDLE] tiempo cumplido, ejecutando onIdle");
        onIdleRef.current();
      }, timeoutMs);
    };

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMs, enabled]);
}
