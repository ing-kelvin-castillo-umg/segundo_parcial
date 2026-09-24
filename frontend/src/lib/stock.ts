/** Umbral (inclusive) a partir del cual un producto se considera con stock bajo. */
export const LOW_STOCK_THRESHOLD = 10;

export type StockLevel = "out" | "low" | "ok";

export function getStockLevel(stock: number | undefined | null): StockLevel {
  const value = Number(stock) || 0;
  if (value <= 0) return "out";
  if (value <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}

/** Clase de badge y texto para cada nivel de stock (verde / ámbar / rojo). */
export const STOCK_BADGE: Record<StockLevel, { className: string; label: (stock: number) => string }> = {
  ok: { className: "badge-success", label: (stock) => `${stock} unidades` },
  low: { className: "badge-warning", label: (stock) => `Stock bajo · ${stock}` },
  out: { className: "badge-danger", label: () => "Agotado" },
};
