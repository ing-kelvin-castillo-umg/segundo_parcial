"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Product } from "@/entities/product.entity";
import { getStockLevel, STOCK_BADGE } from "@/lib/stock";
import { ChevronLeft, ChevronRight, Tag, ArrowRight } from "lucide-react";

interface CarouselProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";

/** Tarjetas visibles según el ancho: 1 (móvil), 2 (≥768px), 3 (≥1024px). */
function useItemsPerView(): number {
  const [items, setItems] = useState(1);

  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const md = window.matchMedia("(min-width: 768px)");
    const update = () => setItems(lg.matches ? 3 : md.matches ? 2 : 1);
    update();
    lg.addEventListener("change", update);
    md.addEventListener("change", update);
    return () => {
      lg.removeEventListener("change", update);
      md.removeEventListener("change", update);
    };
  }, []);

  return items;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

export const Carousel: React.FC<CarouselProps> = ({ products, onSelectProduct }) => {
  const itemsPerView = useItemsPerView();
  const reducedMotion = usePrefersReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const maxIndex = Math.max(0, products.length - itemsPerView);
  const pageCount = maxIndex + 1;

  // Si cambia el ancho (o la lista), el índice no puede quedar fuera de rango.
  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused || reducedMotion || pageCount <= 1) return;
    const interval = setInterval(nextSlide, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [isPaused, reducedMotion, nextSlide, pageCount]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      if (delta < 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  if (!products || products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Cargando productos">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`card overflow-hidden ${i > 0 ? "hidden md:block" : ""} ${i > 1 ? "md:hidden lg:block" : ""}`}>
            <div className="h-52 bg-muted animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
              <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const slideWidthPct = 100 / itemsPerView;

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Productos destacados"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsPaused(false);
      }}
      className="relative rounded-3xl"
    >
      {/* Pista de tarjetas */}
      <div
        className="overflow-hidden -mx-3 px-0 py-4"
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <ul
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${currentIndex * slideWidthPct}%)` }}
          aria-live={isPaused ? "polite" : "off"}
        >
          {products.map((product, idx) => {
            const visible = idx >= currentIndex && idx < currentIndex + itemsPerView;
            const level = getStockLevel(product.stock);
            const stockBadge = STOCK_BADGE[level];

            return (
              <li
                key={product.id ?? idx}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={`${idx + 1} de ${products.length}: ${product.name}`}
                aria-hidden={!visible}
                className="shrink-0 px-3"
                style={{ width: `${slideWidthPct}%` }}
              >
                <article className="card group h-full flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  {/* Imagen + badges */}
                  <div className="relative h-52 overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl || FALLBACK_IMAGE}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/50 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 badge border-white/20 bg-secondary-900/80 text-white backdrop-blur-sm">
                      <Tag className="w-3 h-3" aria-hidden="true" />
                      {product.category || "General"}
                    </span>
                    <span className={`absolute top-3 right-3 badge shadow-sm ${stockBadge.className}`}>
                      {stockBadge.label(product.stock)}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 flex flex-col p-5 gap-3">
                    <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                      <div>
                        <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Precio
                        </span>
                        <span className="inline-block mt-0.5 px-2.5 py-1 rounded-lg bg-accent-100 text-accent-800 text-xl font-black tabular-nums">
                          {product.formattedPrice}
                        </span>
                      </div>

                      {onSelectProduct && (
                        <button
                          onClick={() => onSelectProduct(product)}
                          tabIndex={visible ? 0 : -1}
                          aria-label={`Ver detalle de ${product.name}`}
                          className="btn btn-primary btn-sm px-3.5 py-2"
                        >
                          <span>Ver detalle</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Controles */}
      {pageCount > 1 && (
        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" aria-label="Seleccionar posición del carrusel">
            {Array.from({ length: pageCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir a la posición ${idx + 1} de ${pageCount}`}
                aria-current={idx === currentIndex ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-8 bg-primary" : "w-2.5 bg-input hover:bg-secondary-300"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Productos anteriores"
              className="p-2.5 rounded-full border border-border bg-surface text-secondary-900 shadow-card hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Productos siguientes"
              className="p-2.5 rounded-full border border-border bg-surface text-secondary-900 shadow-card hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
