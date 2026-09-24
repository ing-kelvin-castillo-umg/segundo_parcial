"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/entities/product.entity";
import { getStockLevel, STOCK_BADGE } from "@/lib/stock";
import { Search, Plus, Eye, Pencil, Trash2, PackageOpen, Tag, X, Lock, LucideIcon } from "lucide-react";

interface DataTableProps {
  products: Product[];
  isAdmin: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreate: () => void;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";

/** Botón de acción con ícono, aria-label y tooltip. */
const ActionButton: React.FC<{
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  tone: "view" | "edit" | "delete";
}> = ({ label, icon: Icon, onClick, tone }) => {
  const toneClass = {
    view: "hover:text-primary-700 hover:bg-primary-50",
    edit: "hover:text-accent-800 hover:bg-accent-100",
    delete: "hover:text-danger-700 hover:bg-danger-50",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`tooltip-trigger p-2 rounded-lg text-muted-foreground transition-colors ${toneClass}`}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span className="tooltip" role="tooltip">
        {label}
      </span>
    </button>
  );
};

const ProductThumb: React.FC<{ product: Product; size: string }> = ({ product, size }) => (
  <div className={`${size} rounded-xl overflow-hidden bg-muted border border-border shrink-0`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={product.imageUrl || FALLBACK_IMAGE}
      alt=""
      loading="lazy"
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      onError={(e) => {
        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
      }}
    />
  </div>
);

const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  const badge = STOCK_BADGE[getStockLevel(stock)];
  return <span className={`badge ${badge.className}`}>{badge.label(stock)}</span>;
};

export const DataTable: React.FC<DataTableProps> = ({
  products,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const query = searchTerm.toLowerCase();

    return products.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(query);
      const matchDesc = p.description?.toLowerCase().includes(query);
      const matchCategory = p.category?.toLowerCase().includes(query);
      const matchPrice = p.price?.toString().includes(query) || p.formattedPrice?.toLowerCase().includes(query);
      const matchStock = p.stock?.toString().includes(query);

      return matchName || matchDesc || matchCategory || matchPrice || matchStock;
    });
  }, [products, searchTerm]);

  const renderActions = (product: Product) => (
    <div className="inline-flex items-center gap-1">
      <ActionButton label="Ver detalle" icon={Eye} tone="view" onClick={() => onView(product)} />
      {isAdmin && <ActionButton label="Editar" icon={Pencil} tone="edit" onClick={() => onEdit(product)} />}
      {isAdmin && <ActionButton label="Eliminar" icon={Trash2} tone="delete" onClick={() => onDelete(product)} />}
    </div>
  );

  const emptyState = (
    <div className="px-6 py-14 text-center">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-muted flex items-center justify-center">
        <PackageOpen className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="font-semibold text-foreground">No se encontraron productos</p>
      <p className="text-sm text-muted-foreground mt-1">
        {searchTerm ? `No hay coincidencias para "${searchTerm}"` : "Aún no hay productos registrados en el sistema."}
      </p>
    </div>
  );

  return (
    <div className="card w-full overflow-hidden">
      {/* Barra de herramientas */}
      <div className="p-4 sm:p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/40">
        <div className="relative w-full md:w-96">
          <label htmlFor="product-search" className="sr-only">
            Buscar productos
          </label>
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            id="product-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, categoría, precio, stock..."
            className="input pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end">
          <span className="text-xs text-muted-foreground font-medium" aria-live="polite">
            Mostrando <strong className="text-foreground">{filteredProducts.length}</strong> de {products.length} productos
          </span>

          {isAdmin ? (
            <button onClick={onCreate} className="btn btn-primary">
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Nuevo Producto</span>
            </button>
          ) : (
            <span className="badge badge-warning py-1.5 px-3">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              Modo lectura (usuario estándar)
            </span>
          )}
        </div>
      </div>

      {/* Móvil: vista de tarjetas */}
      <ul className="md:hidden divide-y divide-border">
        {filteredProducts.length > 0
          ? filteredProducts.map((product) => (
              <li key={product.id} className="group p-4 flex gap-3 hover:bg-primary-50/50 transition-colors">
                <ProductThumb product={product} size="w-16 h-16" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-foreground leading-snug line-clamp-2">{product.name}</p>
                    <span className="font-extrabold text-foreground tabular-nums whitespace-nowrap">
                      {product.formattedPrice}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="badge badge-neutral">
                      <Tag className="w-3 h-3" aria-hidden="true" />
                      {product.category}
                    </span>
                    <StockBadge stock={product.stock} />
                  </div>
                  <div className="flex justify-end -mr-2">{renderActions(product)}</div>
                </div>
              </li>
            ))
          : <li>{emptyState}</li>}
      </ul>

      {/* Escritorio/tablet: tabla con encabezado sticky y scroll horizontal si hace falta */}
      <div className="hidden md:block max-h-[65vh] overflow-auto">
        <table className="w-full text-left text-sm text-muted-foreground">
          <caption className="sr-only">Listado de productos</caption>
          <thead className="sticky top-0 z-10 bg-primary-700 text-white text-xs uppercase font-bold tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5">Producto</th>
              <th scope="col" className="px-6 py-3.5">Categoría</th>
              <th scope="col" className="px-6 py-3.5 text-right">Precio</th>
              <th scope="col" className="px-6 py-3.5">Inventario</th>
              <th scope="col" className="px-6 py-3.5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="group odd:bg-surface even:bg-muted/50 hover:bg-primary-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-4">
                      <ProductThumb product={product} size="w-12 h-12" />
                      <div className="max-w-xs lg:max-w-sm">
                        <p className="font-bold text-foreground line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span className="badge badge-neutral">
                      <Tag className="w-3 h-3" aria-hidden="true" />
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-right font-extrabold text-foreground tabular-nums">
                    {product.formattedPrice}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <StockBadge stock={product.stock} />
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-center">{renderActions(product)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>{emptyState}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
