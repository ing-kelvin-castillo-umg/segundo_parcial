"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

const INACTIVITY_LIMIT_MS = 2 * 60 * 1000;
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
];

export function SessionTimeout() {
  const { isAuthenticated, logout } = useAuth();
  const lastActivityAt = useRef(Date.now());
  const isClosingSession = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const registerActivity = () => {
      lastActivityAt.current = Date.now();
    };

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - lastActivityAt.current;
      if (elapsed >= INACTIVITY_LIMIT_MS && !isClosingSession.current) {
        isClosingSession.current = true;
        void logout("inactivity");
      }
    }, 1_000);

    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, registerActivity));

    return () => {
      window.clearInterval(intervalId);
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, registerActivity));
    };
  }, [isAuthenticated, logout]);

  return null;
}
