"use client";

import { useEffect } from "react";

/**
 * Comportamiento común de los diálogos: cierre con la tecla Escape y bloqueo del
 * desplazamiento de la página mientras el diálogo permanece abierto.
 */
export function useModalBehavior(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);
}
