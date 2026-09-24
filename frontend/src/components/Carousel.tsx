"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/entities/product.entity";
import { ChevronLeft, ChevronRight, Tag, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface CarouselProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

const AUTO_ADVANCE_MS = 4500;

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
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [isHovered, nextSlide, products.length]);

  if (!products || products.length === 0) {
    return (
      <div className="w-full h-80 rounded-3xl bg-navy-900/60 border border-white/10 flex flex-col items-center justify-center text-navy-300 p-8">
        <Sparkles className="w-12 h-12 mb-3 text-turquoise-400 animate-pulse" />
        <p className="text-base font-medium">Cargando catálogo de productos...</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-electric-900 text-white shadow-glow ring-1 ring-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-electric-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-turquoise-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Slide Content */}
      <div className="relative min-h-[520px] sm:min-h-[460px] grid grid-cols-1 lg:grid-cols-12 items-center px-5 pt-6 pb-24 sm:px-16 sm:pt-10 sm:pb-16 gap-6 sm:gap-8">
        {/* Text Info (Left) */}
        <div key={currentProduct.id ?? currentIndex} className="lg:col-span-6 flex flex-col justify-center space-y-4 z-10 animate-fade-up order-2 lg:order-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-turquoise-400/15 text-turquoise-200 border border-turquoise-300/30 backdrop-blur-sm">
              <Tag className="w-3.5 h-3.5" />
              {currentProduct.category}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                currentProduct.inStock
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-rose-500/20 text-rose-200 border border-rose-400/30"
              }`}
            >
              {currentProduct.inStock ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-turquoise-300" /> {currentProduct.stock} disponibles
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

          <p className="text-navy-200 text-sm sm:text-base leading-relaxed line-clamp-3">
            {currentProduct.description}
          </p>

          <div className="pt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-turquoise-300 via-sky-300 to-electric-300">
              {currentProduct.formattedPrice}
            </span>
            <span className="text-xs text-navy-300 uppercase tracking-wider">Precio sugerido</span>
          </div>

          {onSelectProduct && (
            <div className="pt-2">
              <button
                onClick={() => onSelectProduct(currentProduct)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-500 hover:bg-electric-400 text-white font-semibold text-sm shadow-glow transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Ver Detalle del Producto</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Image Preview (Right) */}
        <div className="lg:col-span-6 flex items-center justify-center relative order-1 lg:order-2">
          <div className="w-full max-w-md h-52 sm:h-80 relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15 group">
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
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent pointer-events-none" />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-navy-950/70 backdrop-blur text-[11px] font-bold tracking-widest text-turquoise-200">
              {pad(currentIndex + 1)} / {pad(products.length)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Controls: laterales en escritorio, inferiores en móvil */}
      <button
        onClick={prevSlide}
        aria-label="Producto anterior"
        className="absolute bottom-4 left-4 sm:bottom-auto sm:left-3 sm:top-1/2 sm:-translate-y-1/2 p-2.5 rounded-full bg-navy-950/60 hover:bg-electric-500 text-white border border-white/15 backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Siguiente producto"
        className="absolute bottom-4 right-4 sm:bottom-auto sm:right-3 sm:top-1/2 sm:-translate-y-1/2 p-2.5 rounded-full bg-navy-950/60 hover:bg-electric-500 text-white border border-white/15 backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {products.map((p, idx) => (
          <button
            key={p.id || idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Ir a producto ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? "w-8 h-2.5 bg-turquoise-400"
                : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Progreso del avance automático */}
      {products.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            key={`${currentIndex}-${isHovered}`}
            className="h-full origin-left bg-gradient-to-r from-turquoise-400 to-electric-400"
            style={isHovered ? { transform: "scaleX(0)" } : { animation: `progress ${AUTO_ADVANCE_MS}ms linear forwards` }}
          />
        </div>
      )}
    </div>
  );
};
