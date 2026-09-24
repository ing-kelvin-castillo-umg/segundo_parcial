"use client";

import { useEffect, useRef } from "react";

const MOUSEMOVE_THROTTLE_MS = 1_000;

interface SessionInactivityOptions {
  enabled: boolean;
  timeoutMs: number;
  onInactive: () => Promise<void> | void;
}

export function useSessionInactivity({ enabled, timeoutMs, onInactive }: SessionInactivityOptions): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef(Date.now());
  const logoutInProgressRef = useRef(false);
  const onInactiveRef = useRef(onInactive);

  useEffect(() => {
    onInactiveRef.current = onInactive;
  }, [onInactive]);

  useEffect(() => {
    const clearTimer = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    if (!enabled || timeoutMs <= 0) {
      clearTimer();
      return;
    }

    logoutInProgressRef.current = false;
    lastActivityRef.current = Date.now();
    let lastMousemoveHandledAt = 0;

    const beginLogout = () => {
      if (logoutInProgressRef.current) return;

      logoutInProgressRef.current = true;
      clearTimer();
      void onInactiveRef.current();
    };

    const checkInactivity = () => {
      if (logoutInProgressRef.current) return;

      const remainingMs = timeoutMs - (Date.now() - lastActivityRef.current);
      if (remainingMs <= 0) {
        beginLogout();
        return;
      }

      clearTimer();
      timeoutRef.current = setTimeout(checkInactivity, remainingMs);
    };

    const registerActivity = () => {
      if (logoutInProgressRef.current) return;

      lastActivityRef.current = Date.now();
      clearTimer();
      timeoutRef.current = setTimeout(checkInactivity, timeoutMs);
    };

    const handleMousemove = () => {
      const now = Date.now();
      if (now - lastMousemoveHandledAt < MOUSEMOVE_THROTTLE_MS) return;

      lastMousemoveHandledAt = now;
      registerActivity();
    };

    const checkAfterBrowserResume = () => {
      if (logoutInProgressRef.current) return;

      if (Date.now() - lastActivityRef.current >= timeoutMs) {
        beginLogout();
        return;
      }

      registerActivity();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAfterBrowserResume();
      }
    };

    const passiveOptions: AddEventListenerOptions = { passive: true };
    window.addEventListener("mousemove", handleMousemove, passiveOptions);
    window.addEventListener("keydown", registerActivity);
    window.addEventListener("mousedown", registerActivity, passiveOptions);
    window.addEventListener("pointerdown", registerActivity, passiveOptions);
    window.addEventListener("touchstart", registerActivity, passiveOptions);
    window.addEventListener("scroll", registerActivity, passiveOptions);
    window.addEventListener("focus", checkAfterBrowserResume);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    timeoutRef.current = setTimeout(checkInactivity, timeoutMs);

    return () => {
      clearTimer();
      window.removeEventListener("mousemove", handleMousemove);
      window.removeEventListener("keydown", registerActivity);
      window.removeEventListener("mousedown", registerActivity);
      window.removeEventListener("pointerdown", registerActivity);
      window.removeEventListener("touchstart", registerActivity);
      window.removeEventListener("scroll", registerActivity);
      window.removeEventListener("focus", checkAfterBrowserResume);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, timeoutMs]);
}
