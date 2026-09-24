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
} from "lucide-react";

interface DataTableProps {
  products: Product[];
  isAdmin: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreate: () => void;
}

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

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-50/50">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, categoría, precio, stock..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-400 hover:text-surface-600"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Actions & Role Indicator */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-surface-500 font-medium">
            Mostrando {filteredProducts.length} de {products.length} productos
          </span>

          {/* Button Nuevo Producto - Only for ADMIN */}
          {isAdmin ? (
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-all hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-50 border border-accent-200 text-accent-800 text-xs font-medium">
              <span>Modo Lectura (Usuario Estándar)</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabla: a partir de tablet */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-surface-600">
          <thead className="bg-surface-100/70 text-surface-700 text-xs uppercase font-bold tracking-wider border-b border-surface-200">
            <tr>
              <th scope="col" className="px-6 py-4">Producto</th>
              <th scope="col" className="px-6 py-4">Categoría</th>
              <th scope="col" className="px-6 py-4">Precio</th>
              <th scope="col" className="px-6 py-4">Inventario</th>
              <th scope="col" className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-primary-50/40 transition-colors group"
                >
                  {/* Name & Thumbnail */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-100 border border-surface-200 shrink-0 relative">
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
                        <p className="font-bold text-surface-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-surface-500 line-clamp-2 mt-0.5">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-700 border border-surface-200">
                      <Tag className="w-3 h-3 text-surface-400" />
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap font-extrabold text-surface-900">
                    {product.formattedPrice}
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {product.inStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-200">
                          <CheckCircle2 className="w-3 h-3 text-success-500" />
                          {product.stock} unidades
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-50 text-danger-700 border border-danger-200">
                          <AlertCircle className="w-3 h-3 text-danger-500" />
                          Agotado
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
                        className="p-2 text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Action: Editar (Available ONLY for ADMIN) */}
                      {isAdmin && (
                        <button
                          onClick={() => onEdit(product)}
                          title="Editar producto"
                          className="p-2 text-surface-600 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}

                      {/* Action: Eliminar (Available ONLY for ADMIN) */}
                      {isAdmin && (
                        <button
                          onClick={() => onDelete(product)}
                          title="Eliminar producto"
                          className="p-2 text-surface-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
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
                <td colSpan={5} className="px-6 py-12 text-center text-surface-400">
                  <PackageOpen className="w-12 h-12 mx-auto mb-3 text-surface-300" />
                  <p className="font-semibold text-surface-700">No se encontraron productos</p>
                  <p className="text-xs text-surface-500 mt-1">
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

      {/* Tarjetas: vista compacta para móvil */}
      <div className="md:hidden divide-y divide-surface-200">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <article key={product.id} className="p-4 flex gap-3.5">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-100 border border-surface-200 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-surface-900 line-clamp-1">{product.name}</p>
                <p className="text-xs text-surface-500 line-clamp-2 mt-0.5">{product.description}</p>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="font-extrabold text-surface-900 text-sm">{product.formattedPrice}</span>

                  {product.inStock ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success-50 text-success-700 border border-success-200">
                      <CheckCircle2 className="w-3 h-3 text-success-500" />
                      {product.stock} u.
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-danger-50 text-danger-700 border border-danger-200">
                      <AlertCircle className="w-3 h-3 text-danger-500" />
                      Agotado
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-100 text-surface-700 border border-surface-200">
                    <Tag className="w-3 h-3 text-surface-400" />
                    {product.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-2.5">
                  <button
                    onClick={() => onView(product)}
                    className="p-2 text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Ver producto"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-surface-600 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                      title="Editar producto"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => onDelete(product)}
                      className="p-2 text-surface-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="px-6 py-12 text-center text-surface-400">
            <PackageOpen className="w-12 h-12 mx-auto mb-3 text-surface-300" />
            <p className="font-semibold text-surface-700">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  );
};
