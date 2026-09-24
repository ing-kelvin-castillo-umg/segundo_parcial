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
    <div className="w-full bg-slate-900/90 backdrop-blur-xl rounded-[2rem] shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] border border-slate-800 overflow-hidden relative">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Table Toolbar */}
      <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5 bg-slate-950/50 relative z-10">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
          <div className="relative">
            <Search className="w-4 h-4 text-fuchsia-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-fuchsia-500 transition-all backdrop-blur-md"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-fuchsia-400 font-medium transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Actions & Role Indicator */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 font-medium">
            {filteredProducts.length} resultados
          </span>

          {/* Button Nuevo Producto - Only for ADMIN */}
          {isAdmin ? (
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-sm font-extrabold shadow-[0_0_20px_rgba(192,38,211,0.3)] transition-all hover:scale-[1.05] active:scale-[0.95]"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <span>Modo Lectura</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-fuchsia-400 text-xs uppercase font-black tracking-widest border-b border-slate-800/80">
            <tr>
              <th scope="col" className="px-6 py-5">Producto</th>
              <th scope="col" className="px-6 py-5">Categoría</th>
              <th scope="col" className="px-6 py-5">Precio</th>
              <th scope="col" className="px-6 py-5">Inventario</th>
              <th scope="col" className="px-6 py-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-transparent">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Name & Thumbnail */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 relative shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(192,38,211,0.2)] transition-shadow">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                      </div>
                      <div className="max-w-xs sm:max-w-sm">
                        <p className="font-extrabold text-white line-clamp-1 group-hover:text-fuchsia-300 transition-colors tracking-wide">{product.name}</p>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 backdrop-blur-sm">
                      <Tag className="w-3.5 h-3.5" />
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-5 whitespace-nowrap font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-300 text-lg">
                    {product.formattedPrice}
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {product.inStock ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {product.stock} unidades
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Agotado
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onView(product)}
                        title="Ver producto en grande"
                        className="p-2.5 text-slate-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 border border-transparent rounded-xl transition-all hover:scale-110 active:scale-95"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => onEdit(product)}
                          title="Editar producto"
                          className="p-2.5 text-slate-400 hover:text-white hover:bg-amber-500/20 hover:border-amber-500/30 border border-transparent rounded-xl transition-all hover:scale-110 active:scale-95"
                        >
                          <Pencil className="w-4.5 h-4.5" />
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => onDelete(product)}
                          title="Eliminar producto"
                          className="p-2.5 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/30 border border-transparent rounded-xl transition-all hover:scale-110 active:scale-95"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                  <PackageOpen className="w-14 h-14 mx-auto mb-4 text-slate-600 animate-pulse" />
                  <p className="font-bold text-slate-300 text-lg">Catálogo Vacío</p>
                  <p className="text-sm mt-2">
                    {searchTerm
                      ? `No encontramos nada para "${searchTerm}"`
                      : "Aún no hay productos registrados."}
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
