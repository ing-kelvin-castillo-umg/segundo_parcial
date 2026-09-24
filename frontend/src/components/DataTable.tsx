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
    <div className="w-full bg-white rounded-2xl shadow-lg shadow-brand-900/5 border border-brand-100 overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand-50/80">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, categoría, precio, stock..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Actions & Role Indicator */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">
            Mostrando {filteredProducts.length} de {products.length} productos
          </span>

          {/* Button Nuevo Producto - Only for ADMIN */}
          {isAdmin ? (
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm shadow-brand-600/20 transition-all hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <span>Modo Lectura (Usuario Estándar)</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-brand-950 text-brand-50 text-xs uppercase font-bold tracking-wider border-b border-brand-900">
            <tr>
              <th scope="col" className="px-6 py-4">Producto</th>
              <th scope="col" className="px-6 py-4">Categoría</th>
              <th scope="col" className="px-6 py-4">Precio</th>
              <th scope="col" className="px-6 py-4">Inventario</th>
              <th scope="col" className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-brand-50 transition-colors group"
                >
                  {/* Name & Thumbnail */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-brand-50 border border-brand-100 shrink-0 relative">
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
                        <p className="font-bold text-slate-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                      <Tag className="w-3 h-3 text-brand-400" />
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap font-extrabold text-accent-700">
                    {product.formattedPrice}
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {product.inStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {product.stock} unidades
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
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
                        className="p-2 text-slate-600 hover:text-brand-700 hover:bg-brand-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Action: Editar (Available ONLY for ADMIN) */}
                      {isAdmin && (
                        <button
                          onClick={() => onEdit(product)}
                          title="Editar producto"
                          className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}

                      {/* Action: Eliminar (Available ONLY for ADMIN) */}
                      {isAdmin && (
                        <button
                          onClick={() => onDelete(product)}
                          title="Eliminar producto"
                          className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <PackageOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-semibold text-slate-700">No se encontraron productos</p>
                  <p className="text-xs text-slate-500 mt-1">
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
