"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export default function InactivityWatcher({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Configuramos el tiempo en 10 segundos para propósitos de prueba / demostración.
  // En producción, se usaría un valor como 15 * 60 * 1000 (15 minutos).
  const INACTIVITY_LIMIT_MS = 10 * 1000; 

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Solo inicia el temporizador si el usuario está autenticado
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        console.warn(`⚠️ Inactividad detectada (${INACTIVITY_LIMIT_MS / 1000}s). Cerrando sesión automáticamente...`);
        logout();
      }, INACTIVITY_LIMIT_MS);
    }
  };

  useEffect(() => {
    // Si no está autenticado, no hacer nada
    if (!isAuthenticated) return;

    // Eventos que reinician el temporizador
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    const handleActivity = () => resetTimer();

    // Iniciar temporizador por primera vez
    resetTimer();

    // Agregar listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      // Limpieza
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, logout]);

  return <>{children}</>;
}
