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
    const interval = setInterval(nextSlide, 4500);
    return () => clearInterval(interval);
  }, [isHovered, nextSlide, products.length]);

  if (!products || products.length === 0) {
    return (
      <div className="w-full h-80 rounded-2xl bg-harbor-50 border border-harbor-100 flex flex-col items-center justify-center text-harbor-700 p-8">
        <Sparkles className="w-12 h-12 mb-3 text-coral-400 animate-pulse" />
        <p className="text-base font-medium">Cargando catalogo de productos...</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,#f6f2d7_0,#124b46_34%,#061f20_78%)] text-white shadow-2xl border border-harbor-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-citrus-300 via-coral-400 to-harbor-300" />

      <div className="relative min-h-[420px] sm:min-h-[460px] grid grid-cols-1 lg:grid-cols-12 items-center p-6 sm:p-10 gap-8">
        <div className="lg:col-span-6 flex flex-col justify-center space-y-4 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-citrus-200/15 text-citrus-100 border border-citrus-200/30 backdrop-blur-sm">
              <Tag className="w-3.5 h-3.5" />
              {currentProduct.category}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                currentProduct.inStock
                  ? "bg-harbor-300/20 text-harbor-50 border border-harbor-200/30"
                  : "bg-coral-500/20 text-coral-100 border border-coral-400/30"
              }`}
            >
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

          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white line-clamp-2">
            {currentProduct.name}
          </h3>

          <p className="text-harbor-50/80 text-sm sm:text-base leading-relaxed line-clamp-3">
            {currentProduct.description}
          </p>

          <div className="pt-2 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-citrus-200">
              {currentProduct.formattedPrice}
            </span>
            <span className="text-xs text-harbor-100/70 uppercase tracking-wider">Precio sugerido</span>
          </div>

          {onSelectProduct && (
            <div className="pt-2">
              <button
                onClick={() => onSelectProduct(currentProduct)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-400 text-white font-medium text-sm shadow-lg shadow-coral-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Ver Detalle del Producto</span>
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-6 flex items-center justify-center relative">
          <div className="w-full max-w-md h-64 sm:h-80 relative rounded-2xl overflow-hidden shadow-2xl border border-citrus-100/20 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentProduct.imageUrl}
              alt={currentProduct.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-harbor-950/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        aria-label="Producto anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-harbor-950/60 hover:bg-harbor-900/90 text-white border border-citrus-100/20 backdrop-blur-md transition-all hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Siguiente producto"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-harbor-950/60 hover:bg-harbor-900/90 text-white border border-citrus-100/20 backdrop-blur-md transition-all hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {products.map((p, idx) => (
          <button
            key={p.id || idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Ir a producto ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? "w-8 h-2.5 bg-citrus-300"
                : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
