"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_TIMEOUT_MS = 3 * 60 * 1000;

export function useIdleTimeout(enabled: boolean, onIdle: () => void, timeoutMs = DEFAULT_TIMEOUT_MS): number {
  const [remainingSeconds, setRemainingSeconds] = useState(Math.ceil(timeoutMs / 1000));
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!enabled) {
      setRemainingSeconds(Math.ceil(timeoutMs / 1000));
      return;
    }

    let lastActivityAt = Date.now();
    let fired = false;

    const update = () => {
      if (fired) return true;
      const remaining = Math.max(0, timeoutMs - (Date.now() - lastActivityAt));
      setRemainingSeconds(Math.ceil(remaining / 1000));
      if (remaining === 0) {
        fired = true;
        onIdleRef.current();
        return true;
      }
      return false;
    };

    const onActivity = () => {
      if (update()) return;
      lastActivityAt = Date.now();
      setRemainingSeconds(Math.ceil(timeoutMs / 1000));
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") update();
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibilityChange);
    const interval = window.setInterval(update, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, onActivity));
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(interval);
    };
  }, [enabled, timeoutMs]);

  return remainingSeconds;
}
