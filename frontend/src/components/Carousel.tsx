"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/entities/product.entity";
import { ChevronLeft, ChevronRight, Tag, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface CarouselProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const Carousel: React.FC<CarouselProps> = ({ products, onSelectProduct }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    if (products.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const prevSlide = useCallback(() => {
    if (products.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (isHovered || products.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, nextSlide, products.length]);

  if (!products || products.length === 0) {
    return (
      <div className="w-full h-80 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8">
        <Sparkles className="w-12 h-12 mb-3 text-slate-300 animate-pulse" />
        <p className="text-base font-medium">Cargando catálogo de productos...</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-950 via-purple-900 to-indigo-950 text-white shadow-2xl border border-fuchsia-900/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-fuchsia-500/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl pointer-events-none" />

      {/* Slide Content */}
      <div className="relative min-h-[420px] sm:min-h-[460px] grid grid-cols-1 lg:grid-cols-12 items-center p-6 sm:p-10 gap-8">
        {/* Text Info (Left) */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-4 z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30 backdrop-blur-sm">
              <Tag className="w-3.5 h-3.5" />
              {currentProduct.category}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${currentProduct.inStock ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"}`}>
              {currentProduct.inStock ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> {currentProduct.stock} disponibles
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" /> Agotado
                </>
              )}
            </span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white line-clamp-2 drop-shadow-md">
            {currentProduct.name}
          </h3>

          <p className="text-purple-100/80 text-sm sm:text-base leading-relaxed line-clamp-3">
            {currentProduct.description}
          </p>

          <div className="pt-2 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300">
              {currentProduct.formattedPrice}
            </span>
            <span className="text-xs text-purple-200/60 uppercase tracking-wider font-semibold">Precio sugerido</span>
          </div>

          {onSelectProduct && (
            <div className="pt-2">
              <button
                onClick={() => onSelectProduct(currentProduct)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/30 transition-all hover:scale-[1.03] active:scale-[0.97]"
              >
                <span>Ver Detalle del Producto</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Image Preview (Right) */}
        <div className="lg:col-span-6 flex items-center justify-center relative">
          <div className="w-full max-w-md h-64 sm:h-80 relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentProduct.imageUrl}
              alt={currentProduct.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                // Fallback on broken image
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        aria-label="Producto anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white border border-white/10 backdrop-blur-md transition-all hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Siguiente producto"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white border border-white/10 backdrop-blur-md transition-all hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {products.map((p, idx) => (
          <button
            key={p.id || idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Ir a producto ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? "w-8 h-2.5 bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.5)]"
                : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
