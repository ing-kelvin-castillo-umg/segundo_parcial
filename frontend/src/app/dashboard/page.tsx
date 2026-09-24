"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Product } from "@/entities/product.entity";
import { ProductService } from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";
import { MetricCard } from "@/components/MetricCard";
import {
  Boxes,
  Wallet,
  PackageX,
  Tags,
  ArrowRight,
  LayoutDashboard,
  AlertTriangle,
} from "lucide-react";

/** Formato monetario del catálogo (quetzales). */
const currency = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  maximumFractionDigits: 0,
});

export default function DashboardOverviewPage() {
  const { user, isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    ProductService.getAll()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((err) => {
        if (active) setError(err?.message || "No se pudo cargar el inventario.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Las métricas se derivan del catálogo cargado, sin endpoints adicionales.
  const metrics = useMemo(() => {
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const outOfStock = products.filter((p) => !p.inStock).length;
    const categories = new Set(products.map((p) => p.category).filter(Boolean));

    return {
      total: products.length,
      totalStock,
      inventoryValue,
      outOfStock,
      categories: categories.size,
    };
  }, [products]);

  // Productos con menor existencia, para atender reposición.
  const lowStock = useMemo(
    () => [...products].sort((a, b) => a.stock - b.stock).slice(0, 5),
    [products]
  );

  return (
    <div className="px-5 pb-8 pt-2 lg:p-10 lg:pt-2 space-y-8 max-w-7xl w-full mx-auto">
      {/* Encabezado */}
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
          <LayoutDashboard className="w-4 h-4 text-primary-600" />
          <span>Panel de Control</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-surface-900">
          Hola, {user?.fullName?.split(" ")[0] || user?.username}
        </h1>
        <p className="text-sm text-surface-600">
          Resumen del estado actual del inventario.
        </p>
      </header>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-danger-50 border border-danger-200 text-danger-700 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjetas de métricas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Productos"
          value={String(metrics.total)}
          hint={`${metrics.totalStock} unidades en existencia`}
          icon={Boxes}
          tone="primary"
          loading={loading}
        />
        <MetricCard
          label="Valor del inventario"
          value={currency.format(metrics.inventoryValue)}
          hint="Precio por existencias"
          icon={Wallet}
          tone="accent"
          loading={loading}
        />
        <MetricCard
          label="Agotados"
          value={String(metrics.outOfStock)}
          hint={metrics.outOfStock === 0 ? "Sin faltantes" : "Requieren reposición"}
          icon={PackageX}
          tone={metrics.outOfStock > 0 ? "danger" : "success"}
          loading={loading}
        />
        <MetricCard
          label="Categorías"
          value={String(metrics.categories)}
          hint="Líneas de producto activas"
          icon={Tags}
          tone="success"
          loading={loading}
        />
      </section>

      {/* Existencias más bajas */}
      <section className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-200 bg-surface-50/60 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-surface-900">Existencias más bajas</h2>
            <p className="text-xs text-surface-500">Los cinco productos con menor inventario</p>
          </div>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-xl transition-colors"
          >
            <span>Ver inventario</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ul className="divide-y divide-surface-200">
          {loading && (
            <li className="px-5 py-8 text-center text-sm text-surface-400">
              Cargando inventario...
            </li>
          )}

          {!loading && lowStock.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-surface-400">
              Todavía no hay productos registrados.
            </li>
          )}

          {!loading &&
            lowStock.map((product) => (
              <li
                key={product.id}
                className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-primary-50/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-surface-900 truncate">{product.name}</p>
                  <p className="text-xs text-surface-500 truncate">
                    {product.category || "Sin categoría"}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-surface-700 tabular-nums">
                    {product.formattedPrice}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border tabular-nums ${
                      product.inStock
                        ? "bg-success-50 text-success-700 border-success-200"
                        : "bg-danger-50 text-danger-700 border-danger-200"
                    }`}
                  >
                    {product.inStock ? `${product.stock} u.` : "Agotado"}
                  </span>
                </div>
              </li>
            ))}
        </ul>
      </section>

      {!isAdmin && (
        <p className="text-xs text-surface-500">
          Tu cuenta tiene permisos de consulta. La gestión del inventario está reservada al rol
          administrador.
        </p>
      )}
    </div>
  );
}
