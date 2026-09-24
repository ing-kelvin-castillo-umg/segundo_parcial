"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/entities/product.entity";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  PackageOpen,
  CheckCircle2,
  AlertCircle,
  Tag,
  Loader2,
  TriangleAlert,
} from "lucide-react";

interface DataTableProps {
  products: Product[];
  isAdmin: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreate: () => void;
  loading?: boolean;
}

const LOW_STOCK_THRESHOLD = 10;

export const DataTable: React.FC<DataTableProps> = ({
  products,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onCreate,
  loading = false,
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

  return (
    <div className="surface-panel w-full overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-outline flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-primary-light/45 to-surface">
        {/* Search Bar */}
        <div className="relative w-full lg:max-w-md">
          <Search className="w-4 h-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <label htmlFor="product-search" className="sr-only">Buscar productos</label>
          <input
            id="product-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, categoría, precio, stock..."
            className="field-control pl-10 pr-16"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded text-xs font-semibold text-muted hover:text-primary"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Actions & Role Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto lg:justify-end">
          <span className="text-xs text-muted font-medium">
            Mostrando {filteredProducts.length} de {products.length} productos
          </span>

          {/* Button Nuevo Producto - Only for ADMIN */}
          {isAdmin ? (
            <button
              onClick={onCreate}
              className="btn-primary whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary-light border border-secondary/35 text-secondary-dark text-xs font-semibold">
              <span>Modo Lectura (Usuario Estándar)</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" aria-busy={loading}>
        <table className="w-full min-w-[900px] text-left text-sm text-muted">
          <thead className="bg-primary-dark text-white text-xs uppercase font-bold tracking-wider border-b border-primary-dark">
            <tr>
              <th scope="col" className="px-6 py-4">Producto</th>
              <th scope="col" className="px-6 py-4">Categoría</th>
              <th scope="col" className="px-6 py-4">Precio</th>
              <th scope="col" className="px-6 py-4">Inventario</th>
              <th scope="col" className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/80">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-muted">
                  <Loader2 className="w-9 h-9 mx-auto mb-3 animate-spin text-primary" />
                  <p className="font-semibold text-ink">Actualizando inventario</p>
                  <p className="text-xs mt-1">Espera mientras cargamos los productos.</p>
                </td>
              </tr>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-primary-light/30 focus-within:bg-primary-light/30 transition-colors group"
                >
                  {/* Name & Thumbnail */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-secondary border border-outline shrink-0 relative shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                      </div>
                      <div className="max-w-xs sm:max-w-sm">
                        <p className="font-bold text-ink line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted line-clamp-2 mt-0.5">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-light/55 text-primary-dark border border-primary/20">
                      <Tag className="w-3 h-3 text-primary" />
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-extrabold text-ink">{product.formattedPrice}</span>
                    <span className="block text-[10px] uppercase tracking-wide text-muted">Precio</span>
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {product.stock <= 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/25">
                          <AlertCircle className="w-3.5 h-3.5" /> Sin existencias
                        </span>
                      ) : product.stock <= LOW_STOCK_THRESHOLD ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/30">
                          <TriangleAlert className="w-3.5 h-3.5" /> Existencia baja · {product.stock}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/25">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Disponible · {product.stock}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-1.5">
                      {/* Action: Ver (Available for ALL roles) */}
                      <button
                        onClick={() => onView(product)}
                        title="Ver producto en grande"
                        aria-label={`Ver ${product.name}`}
                        className="icon-button text-primary bg-primary-light/45 hover:bg-primary hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Action: Editar (Available ONLY for ADMIN) */}
                      {isAdmin && (
                        <button
                          onClick={() => onEdit(product)}
                          title="Editar producto"
                          aria-label={`Editar ${product.name}`}
                          className="icon-button text-warning bg-warning/10 hover:bg-warning hover:text-white"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}

                      {/* Action: Eliminar (Available ONLY for ADMIN) */}
                      {isAdmin && (
                        <button
                          onClick={() => onDelete(product)}
                          title="Eliminar producto"
                          aria-label={`Eliminar ${product.name}`}
                          className="icon-button text-danger bg-danger/10 hover:bg-danger hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center text-muted">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-light/50 flex items-center justify-center">
                    <PackageOpen className="w-9 h-9 text-primary" />
                  </div>
                  <p className="font-semibold text-ink">No se encontraron productos</p>
                  <p className="text-xs text-muted mt-1">
                    {searchTerm
                      ? `No hay coincidencias para "${searchTerm}"`
                      : "Aún no hay productos registrados en el sistema."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
