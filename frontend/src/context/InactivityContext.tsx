"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface InactivityContextType {
  isActive: boolean;
  timeUntilLogout: number;
  resetTimer: () => void;
}

const InactivityContext = createContext<InactivityContextType | undefined>(undefined);
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "click"] as const;

export function InactivityProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loggingOutRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [timeUntilLogout, setTimeUntilLogout] = useState(INACTIVITY_TIMEOUT);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    timerRef.current = null;
    countdownRef.current = null;
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();
    if (!isAuthenticated || loggingOutRef.current) {
      setIsActive(false);
      return;
    }

    const deadline = Date.now() + INACTIVITY_TIMEOUT;
    setIsActive(true);
    setTimeUntilLogout(INACTIVITY_TIMEOUT);
    timerRef.current = setTimeout(async () => {
      if (loggingOutRef.current) return;
      loggingOutRef.current = true;
      setIsActive(false);
      clearTimers();
      try {
        await logout("inactive");
      } catch (error) {
        // AuthService clears the local session even when the backend is unavailable.
        console.error("Error completing inactivity logout:", error);
      }
    }, INACTIVITY_TIMEOUT);
    countdownRef.current = setInterval(() => {
      setTimeUntilLogout(Math.max(0, deadline - Date.now()));
    }, 1000);
  }, [clearTimers, isAuthenticated, logout]);

  useEffect(() => {
    loggingOutRef.current = false;
    if (!isAuthenticated) {
      clearTimers();
      setIsActive(false);
      setTimeUntilLogout(INACTIVITY_TIMEOUT);
      return;
    }

    resetTimer();
    const handleActivity = () => resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
      clearTimers();
    };
  }, [clearTimers, isAuthenticated, resetTimer]);

  return (
    <InactivityContext.Provider value={{ isActive, timeUntilLogout, resetTimer }}>
      {children}
    </InactivityContext.Provider>
  );
}

export function useInactivityDetector() {
  const context = useContext(InactivityContext);
  if (!context) throw new Error("useInactivityDetector must be used within InactivityProvider");
  return context;
}
