"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Product } from "@/entities/product.entity";
import { ChevronLeft, ChevronRight, Tag, CheckCircle2, AlertCircle, Sparkles, ArrowUpRight } from "lucide-react";

interface CarouselProps { products: Product[]; onSelectProduct?: (product: Product) => void; }

export const Carousel: React.FC<CarouselProps> = ({ products, onSelectProduct }) => {
  const [currentIndex, setCurrentIndex] = useState(0); const [isHovered, setIsHovered] = useState(false);
  const nextSlide = useCallback(() => { if (products.length) setCurrentIndex((i) => (i + 1) % products.length); }, [products.length]);
  const prevSlide = useCallback(() => { if (products.length) setCurrentIndex((i) => (i - 1 + products.length) % products.length); }, [products.length]);
  useEffect(() => { if (isHovered || products.length <= 1) return; const timer = setInterval(nextSlide, 4500); return () => clearInterval(timer); }, [isHovered, nextSlide, products.length]);

  if (!products.length) return <div className="flex h-80 flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white p-8 text-stone-500 shadow-sm"><Sparkles className="mb-3 h-12 w-12 animate-pulse text-jade-400" /><p className="font-medium">Cargando catálogo de productos...</p></div>;
  const product = products[currentIndex];
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-brand-900/20 bg-gradient-to-br from-brand-950 via-brand-900 to-jade-900 text-white shadow-2xl shadow-brand-950/20" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-jade-400/15 blur-3xl" /><div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="relative grid min-h-[430px] grid-cols-1 items-center gap-8 p-7 sm:p-10 lg:grid-cols-12">
        <div className="z-10 space-y-5 lg:col-span-6"><div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/25 bg-white/10 px-3 py-1 text-xs font-semibold text-brand-100"><Tag className="h-3.5 w-3.5" />{product.category}</span><span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${product.inStock ? "border-brand-200/30 bg-brand-400/15 text-brand-100" : "border-rose-200/30 bg-rose-400/15 text-rose-100"}`}>{product.inStock ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}{product.inStock ? `${product.stock} disponibles` : "Agotado"}</span></div>
          <h3 className="line-clamp-2 text-3xl font-black tracking-tight sm:text-4xl">{product.name}</h3><p className="line-clamp-3 max-w-xl text-sm leading-relaxed text-brand-100/80 sm:text-base">{product.description}</p>
          <div className="flex items-baseline gap-3"><span className="bg-gradient-to-r from-amber-200 via-amber-100 to-jade-100 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">{product.formattedPrice}</span><span className="text-xs uppercase tracking-wider text-brand-200">Precio sugerido</span></div>
          {onSelectProduct && <button onClick={() => onSelectProduct(product)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-900 transition hover:-translate-y-0.5 hover:bg-brand-50"><span>Ver detalle</span><ArrowUpRight className="h-4 w-4" /></button>}
        </div>
        <div className="relative lg:col-span-6"><div className="group relative mx-auto h-60 max-w-md overflow-hidden rounded-3xl border border-white/15 shadow-2xl sm:h-80"><img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80"; }} /><div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 to-transparent" /></div></div>
      </div>
      <button onClick={prevSlide} aria-label="Producto anterior" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-brand-950/50 p-2.5 text-white backdrop-blur transition hover:scale-110 hover:bg-brand-950/80"><ChevronLeft className="h-5 w-5" /></button><button onClick={nextSlide} aria-label="Siguiente producto" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-brand-950/50 p-2.5 text-white backdrop-blur transition hover:scale-110 hover:bg-brand-950/80"><ChevronRight className="h-5 w-5" /></button>
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">{products.map((item, index) => <button key={item.id || index} onClick={() => setCurrentIndex(index)} aria-label={`Ir a producto ${index + 1}`} className={`h-2.5 rounded-full transition-all ${index === currentIndex ? "w-8 bg-amber-300" : "w-2.5 bg-white/35 hover:bg-white/70"}`} />)}</div>
    </div>
  );
};
