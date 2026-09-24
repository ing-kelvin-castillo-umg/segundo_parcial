"use client";

import React, { useMemo } from "react";
import { Product } from "@/entities/product.entity";
import { LOW_STOCK_THRESHOLD, getStockLevel } from "@/lib/stock";
import { Boxes, Layers, Tags, AlertTriangle, LucideIcon } from "lucide-react";

interface ProductMetricsProps {
  products: Product[];
  loading?: boolean;
}

interface Metric {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  /** Clases del ícono (fondo + color) según la paleta. */
  tone: string;
}

const numberFormat = new Intl.NumberFormat("es-GT");

export const ProductMetrics: React.FC<ProductMetricsProps> = ({ products, loading = false }) => {
  const metrics = useMemo<Metric[]>(() => {
    const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const categories = new Set(products.map((p) => p.category).filter(Boolean)).size;
    const lowStock = products.filter((p) => getStockLevel(p.stock) !== "ok").length;

    return [
      {
        label: "Total de productos",
        value: numberFormat.format(products.length),
        hint: "Registrados en el catálogo",
        icon: Boxes,
        tone: "bg-primary-50 text-primary-700",
      },
      {
        label: "Stock total",
        value: numberFormat.format(totalStock),
        hint: "Unidades en inventario",
        icon: Layers,
        tone: "bg-secondary-100 text-secondary-800",
      },
      {
        label: "Categorías",
        value: numberFormat.format(categories),
        hint: "Categorías distintas",
        icon: Tags,
        tone: "bg-accent-100 text-accent-800",
      },
      {
        label: "Stock bajo",
        value: numberFormat.format(lowStock),
        hint: `Con ${LOW_STOCK_THRESHOLD} unidades o menos`,
        icon: AlertTriangle,
        tone: lowStock > 0 ? "bg-danger-50 text-danger-700" : "bg-success-50 text-success-700",
      },
    ];
  }, [products]);

  return (
    <section aria-label="Resumen del inventario" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map(({ label, value, hint, icon: Icon, tone }) => (
        <article key={label} className="card p-4 sm:p-5 flex items-start gap-3 sm:gap-4 transition-shadow hover:shadow-card-hover">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground truncate">{label}</p>
            {loading ? (
              <div className="mt-1.5 h-7 w-14 rounded-md bg-muted animate-pulse" aria-hidden="true" />
            ) : (
              <p className="mt-0.5 text-2xl sm:text-3xl font-black tracking-tight text-foreground tabular-nums">{value}</p>
            )}
            <p className="mt-0.5 text-[11px] text-muted-foreground truncate hidden sm:block">{hint}</p>
          </div>
        </article>
      ))}
    </section>
  );
};
