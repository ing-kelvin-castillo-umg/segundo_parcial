"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

const INACTIVITY_LIMIT_MS = 2 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"] as const;

export function SessionTimeout() {
  const { isAuthenticated, logout } = useAuth();
  const timer = useRef<number | null>(null);
  const sessionClosed = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const clearTimer = () => {
      if (timer.current) window.clearTimeout(timer.current);
    };

    const closeInactiveSession = () => {
      if (sessionClosed.current) return;
      sessionClosed.current = true;
      void logout("inactivity");
    };

    const scheduleTimeout = () => {
      if (sessionClosed.current) return;
      clearTimer();
      timer.current = window.setTimeout(closeInactiveSession, INACTIVITY_LIMIT_MS);
    };

    sessionClosed.current = false;
    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, scheduleTimeout, { passive: true }));
    scheduleTimeout();

    return () => {
      clearTimer();
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, scheduleTimeout));
    };
  }, [isAuthenticated, logout]);

  return null;
}
