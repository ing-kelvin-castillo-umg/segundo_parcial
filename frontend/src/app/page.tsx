"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Package, Sparkles, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Carousel } from "@/components/Carousel";
import { ViewProductModal } from "@/components/ProductModals";
import { Product } from "@/entities/product.entity";
import { ProductService } from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    ProductService.getAll().then(setProducts).catch(() => setProducts([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f5ff] text-forest">
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-plum text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(210,203,254,.28),transparent_28%),radial-gradient(circle_at_92%_84%,rgba(205,252,138,.18),transparent_30%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lavender/15 border border-lavender/30 text-lavender text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-lime" /> Catálogo UMG · tecnología para cada idea
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.05]">
                Encuentra lo que impulsa <span className="text-lime">tu próximo proyecto.</span>
              </h1>
              <p className="max-w-xl text-lavender/85 text-base sm:text-lg leading-relaxed">Un catálogo claro y ágil para descubrir equipos, accesorios y tecnología seleccionada para ti.</p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a href="#catalogo" className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-lime text-forest font-bold text-sm hover:bg-white transition-colors">Explorar catálogo <ArrowRight className="w-4 h-4" /></a>
                <Link href={isAuthenticated ? "/dashboard/products" : "/login"} className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl border border-lavender/45 text-lavender font-semibold text-sm hover:bg-lavender/10 transition-colors">{isAuthenticated ? "Ir al panel" : "Iniciar sesión"}</Link>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs text-lavender/80">
                {['Productos disponibles', 'Acceso seguro', 'Gestión en tiempo real'].map(item => <span key={item} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-lime" />{item}</span>)}
              </div>
            </div>
            <div className="min-w-0"><Carousel products={products} onSelectProduct={setSelectedProduct} /></div>
          </div>
        </section>

        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-plum">Selección destacada</p><h2 className="mt-2 text-3xl sm:text-4xl font-black text-forest">Productos más solicitados</h2><p className="mt-2 text-sm text-forest/65">Los favoritos del catálogo, listos para descubrir.</p></div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-plum bg-lavender/50 px-3 py-2 rounded-full"><Star className="w-3.5 h-3.5 fill-current" /> Selección de temporada</span>
          </div>
          {products.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.slice(0, 6).map((product) => <button key={product.id} onClick={() => setSelectedProduct(product)} className="group text-left bg-white rounded-2xl overflow-hidden border border-lavender/70 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/10 transition-all focus:outline-none focus:ring-2 focus:ring-plum">
              <div className="h-48 overflow-hidden bg-lavender/30"><img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
              <div className="p-5"><div className="flex items-center justify-between gap-3"><span className="text-[11px] font-bold uppercase tracking-wide text-plum">{product.category}</span><span className="text-xs font-semibold text-forest bg-lime/65 px-2.5 py-1 rounded-full">{product.stock} disponibles</span></div><h3 className="mt-3 font-bold text-forest line-clamp-1">{product.name}</h3><p className="mt-1 text-xs leading-relaxed text-forest/60 line-clamp-2">{product.description}</p><p className="mt-4 font-black text-xl text-plum">{product.formattedPrice}</p></div>
            </button>)}
          </div> : <div className="p-10 rounded-2xl border border-dashed border-lavender bg-white text-center text-forest/60"><Package className="w-9 h-9 mx-auto mb-3 text-plum" />Cargando los productos destacados…</div>}
        </section>
      </main>
      <footer className="bg-forest text-lavender/75 py-8 text-center text-xs"><p>Universidad Mariano Gálvez de Guatemala · Facultad de Ingeniería en Sistemas</p></footer>
      <ViewProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
