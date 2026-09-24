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
    <div className="w-full bg-white rounded-2xl shadow-card border border-navy-200 overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-navy-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-navy-50 to-white">
        {/* Search Bar */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, categoría, precio, stock..."
            className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-navy-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-electric-600 hover:text-electric-800"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Actions & Role Indicator */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <span className="text-xs text-navy-500 font-medium">
            Mostrando {filteredProducts.length} de {products.length} productos
          </span>

          {/* Button Nuevo Producto - Only for ADMIN */}
          {isAdmin ? (
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-electric-600 hover:bg-electric-700 text-white text-sm font-semibold shadow-sm transition-all hover:shadow-glow"
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
        <table className="w-full text-left text-sm text-navy-600">
          <thead className="bg-navy-900 text-navy-100 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-4">Producto</th>
              <th scope="col" className="px-6 py-4 hidden xl:table-cell">Categoría</th>
              <th scope="col" className="px-6 py-4 hidden sm:table-cell">Precio</th>
              <th scope="col" className="px-6 py-4 hidden xl:table-cell">Inventario</th>
              <th scope="col" className="px-2 sm:px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="odd:bg-white even:bg-navy-50/60 hover:bg-electric-50 transition-colors group"
                >
                  {/* Name & Thumbnail */}
                  <td className="pl-3 pr-1 sm:px-6 py-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-navy-100 ring-1 ring-navy-200 shrink-0 relative">
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
                      <div className="min-w-0 sm:max-w-sm">
                        <p className="font-bold text-navy-900 line-clamp-2 sm:line-clamp-1 leading-snug">{product.name}</p>
                        <p className="text-xs text-navy-500 line-clamp-2 mt-0.5 hidden sm:block">
                          {product.description}
                        </p>
                        {/* En pantallas pequeñas la categoría y el inventario se muestran bajo el nombre */}
                        <div className="xl:hidden flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="sm:hidden text-sm font-extrabold text-navy-900 mr-1">{product.formattedPrice}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-electric-50 text-electric-700 border border-electric-100">
                            {product.category}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              product.inStock
                                ? "bg-turquoise-50 text-turquoise-700 border-turquoise-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {product.inStock ? `${product.stock} uds.` : "Agotado"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-electric-50 text-electric-700 border border-electric-100">
                      <Tag className="w-3 h-3 text-electric-400" />
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap font-extrabold text-navy-900 hidden sm:table-cell">
                    {product.formattedPrice}
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                    <div className="flex items-center gap-1.5">
                      {product.inStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-turquoise-50 text-turquoise-700 border border-turquoise-200">
                          <CheckCircle2 className="w-3 h-3 text-turquoise-500" />
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
                  <td className="px-1 sm:px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                      {/* Action: Ver (Available for ALL roles) */}
                      <button
                        onClick={() => onView(product)}
                        title="Ver producto en grande"
                        aria-label="Ver producto"
                        className="p-2 text-navy-500 hover:text-electric-700 hover:bg-electric-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Action: Editar (Available ONLY for ADMIN) */}
                      {isAdmin && (
                        <button
                          onClick={() => onEdit(product)}
                          title="Editar producto"
                          aria-label="Editar producto"
                          className="p-2 text-navy-500 hover:text-turquoise-700 hover:bg-turquoise-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}

                      {/* Action: Eliminar (Available ONLY for ADMIN) */}
                      {isAdmin && (
                        <button
                          onClick={() => onDelete(product)}
                          title="Eliminar producto"
                          aria-label="Eliminar producto"
                          className="p-2 text-navy-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
                <td colSpan={5} className="px-4 sm:px-6 py-12 text-center text-navy-400">
                  <PackageOpen className="w-12 h-12 mx-auto mb-3 text-navy-300" />
                  <p className="font-semibold text-navy-700">No se encontraron productos</p>
                  <p className="text-xs text-navy-500 mt-1">
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
