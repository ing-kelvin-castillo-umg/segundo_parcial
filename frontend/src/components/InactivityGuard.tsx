"use client";

import { useAuth } from "@/context/AuthContext";
import { useSessionInactivity } from "@/hooks/useSessionInactivity";

interface InactivityGuardProps {
  timeoutMs: number;
}

export function InactivityGuard({ timeoutMs }: InactivityGuardProps) {
  const { isAuthenticated, loading, logoutForInactivity } = useAuth();

  useSessionInactivity({
    enabled: !loading && isAuthenticated,
    timeoutMs,
    onInactive: logoutForInactivity,
  });

  return null;
}
