"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricTone = "primary" | "accent" | "success" | "danger";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: MetricTone;
  loading?: boolean;
}

/** Estilos por tono, con clases completas para que Tailwind las conserve. */
const TONE_STYLES: Record<MetricTone, { chip: string; bar: string }> = {
  primary: { chip: "bg-primary-100 text-primary-700", bar: "bg-primary-500" },
  accent: { chip: "bg-accent-100 text-accent-700", bar: "bg-accent-500" },
  success: { chip: "bg-success-100 text-success-700", bar: "bg-success-500" },
  danger: { chip: "bg-danger-100 text-danger-700", bar: "bg-danger-500" },
};

/** Tarjeta de métrica del panel de resumen. */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  loading = false,
}) => {
  const styles = TONE_STYLES[tone];

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-surface-200 shadow-card p-5 transition-shadow hover:shadow-lg animate-fade-in-up">
      <span className={cn("absolute inset-x-0 top-0 h-1", styles.bar)} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-500">
            {label}
          </p>

          {loading ? (
            <div className="mt-2 h-8 w-24 rounded-lg bg-surface-100 animate-pulse" />
          ) : (
            <p className="mt-1 text-xl sm:text-2xl font-black text-surface-900 tabular-nums break-words leading-tight">
              {value}
            </p>
          )}

          {hint && <p className="mt-1 text-xs text-surface-500">{hint}</p>}
        </div>

        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", styles.chip)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
