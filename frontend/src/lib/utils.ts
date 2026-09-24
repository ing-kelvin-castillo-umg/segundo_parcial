import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases condicionales resolviendo los conflictos de utilidades de
 * Tailwind (la última declaración de una misma propiedad gana).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
