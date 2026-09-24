"use client";

import React, { useMemo, useState } from "react";
import { Product } from "@/entities/product.entity";
import { Search, Plus, Eye, Pencil, Trash2, PackageOpen, CheckCircle2, AlertCircle, Tag } from "lucide-react";

interface DataTableProps {
  products: Product[];
  isAdmin: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreate: () => void;
}

const fallbackImage = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";

export const DataTable: React.FC<DataTableProps> = ({ products, isAdmin, onView, onEdit, onDelete, onCreate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => [product.name, product.description, product.category, product.price?.toString(), product.formattedPrice, product.stock?.toString()].some((value) => value?.toLowerCase().includes(query)));
  }, [products, searchTerm]);

  const ProductActions = ({ product }: { product: Product }) => (
    <div className="flex items-center gap-1">
      <button onClick={() => onView(product)} title="Ver producto" aria-label={`Ver ${product.name}`} className="rounded-lg p-2 text-stone-600 transition hover:bg-jade-50 hover:text-jade-700"><Eye className="h-4 w-4" /></button>
      {isAdmin && <button onClick={() => onEdit(product)} title="Editar producto" aria-label={`Editar ${product.name}`} className="rounded-lg p-2 text-stone-600 transition hover:bg-amber-50 hover:text-amber-700"><Pencil className="h-4 w-4" /></button>}
      {isAdmin && <button onClick={() => onDelete(product)} title="Eliminar producto" aria-label={`Eliminar ${product.name}`} className="rounded-lg p-2 text-stone-600 transition hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button>}
    </div>
  );

  const StockBadge = ({ product }: { product: Product }) => product.inStock ? <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800"><CheckCircle2 className="h-3.5 w-3.5" />{product.stock} unidades</span> : <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700"><AlertCircle className="h-3.5 w-3.5" />Agotado</span>;

  return (
    <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-stone-200 bg-stone-50/80 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar nombre, categoría o stock..." className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-16 text-sm text-zinc-900 placeholder:text-stone-400 transition focus:border-jade-500 focus:outline-none focus:ring-2 focus:ring-jade-200" />
          {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-500 hover:text-brand-700">Limpiar</button>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
          <span className="text-xs font-medium text-stone-500">Mostrando <strong className="text-zinc-800">{filteredProducts.length}</strong> de {products.length}</span>
          {isAdmin ? <button onClick={onCreate} className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-700/15 transition hover:bg-brand-800"><Plus className="h-4 w-4" />Nuevo producto</button> : <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Modo lectura</span>}
        </div>
      </div>

      {/* Mobile: each product becomes a readable card, without horizontal scrolling. */}
      <div className="divide-y divide-stone-100 md:hidden">
        {filteredProducts.length ? filteredProducts.map((product) => (
          <article key={product.id} className="p-4">
            <div className="flex gap-3">
              <img src={product.imageUrl} alt={product.name} className="h-16 w-16 shrink-0 rounded-2xl border border-stone-200 object-cover" onError={(event) => { (event.target as HTMLImageElement).src = fallbackImage; }} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-zinc-900">{product.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-stone-500">{product.description}</p>
                <span className="mt-2 inline-flex max-w-full items-center gap-1 truncate rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-700"><Tag className="h-3 w-3 shrink-0 text-jade-600" />{product.category}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
              <div><p className="text-lg font-black text-zinc-900">{product.formattedPrice}</p><div className="mt-1"><StockBadge product={product} /></div></div>
              <ProductActions product={product} />
            </div>
          </article>
        )) : <EmptyState searchTerm={searchTerm} />}
      </div>

      {/* Tablet and desktop: retain the complete comparison table. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-100/70 text-[11px] font-bold uppercase tracking-wider text-stone-600"><tr><th className="px-6 py-4">Producto</th><th className="px-6 py-4">Categoría</th><th className="px-6 py-4">Precio</th><th className="px-6 py-4">Inventario</th><th className="px-6 py-4 text-center">Acciones</th></tr></thead>
          <tbody className="divide-y divide-stone-100">
            {filteredProducts.length ? filteredProducts.map((product) => <tr key={product.id} className="group transition hover:bg-brand-50/45"><td className="px-6 py-4"><div className="flex items-center gap-3"><img src={product.imageUrl} alt={product.name} className="h-12 w-12 shrink-0 rounded-xl border border-stone-200 bg-stone-100 object-cover transition group-hover:scale-105" onError={(event) => { (event.target as HTMLImageElement).src = fallbackImage; }} /><div className="max-w-[250px]"><p className="truncate font-bold text-zinc-900">{product.name}</p><p className="mt-0.5 line-clamp-1 text-xs text-stone-500">{product.description}</p></div></div></td><td className="px-6 py-4"><span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-700"><Tag className="h-3 w-3 text-jade-600" />{product.category}</span></td><td className="px-6 py-4 font-extrabold text-zinc-900">{product.formattedPrice}</td><td className="px-6 py-4"><StockBadge product={product} /></td><td className="px-6 py-4"><div className="flex justify-center"><ProductActions product={product} /></div></td></tr>) : <tr><td colSpan={5}><EmptyState searchTerm={searchTerm} /></td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
};

function EmptyState({ searchTerm }: { searchTerm: string }) {
  return <div className="px-6 py-14 text-center"><PackageOpen className="mx-auto mb-3 h-12 w-12 text-stone-300" /><p className="font-bold text-zinc-800">No se encontraron productos</p><p className="mt-1 text-xs text-stone-500">{searchTerm ? `No hay coincidencias para “${searchTerm}”.` : "Aún no hay productos registrados."}</p></div>;
}
