"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Carousel } from "@/components/Carousel";
import { ViewProductModal } from "@/components/ProductModals";
import { Product } from "@/entities/product.entity";
import { ProductService } from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Layers,
  Code2,
} from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getAll();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.warn("No se pudo conectar a la API del backend, usando datos por defecto:", err);
        // Fallback dummy products for initial display before backend startup
        setProducts([
          {
            id: 1,
            name: "Laptop Pro 16 Ultra",
            description: "Portátil de alto rendimiento con procesador de última generación, 32GB RAM y 1TB SSD NVMe.",
            price: 1499.99,
            stock: 15,
            imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
            category: "Computación",
            formattedPrice: "Q1,499.99",
            inStock: true,
          },
          {
            id: 2,
            name: "Monitor Curvo UltraWide 34",
            description: "Pantalla curva IPS con resolución WQHD, tasa de refresco de 144Hz y soporte HDR400.",
            price: 649.50,
            stock: 25,
            imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
            category: "Monitores",
            formattedPrice: "Q649.50",
            inStock: true,
          },
          {
            id: 3,
            name: "Auriculares Inalámbricos Studio ANC",
            description: "Cancelación activa de ruido híbrida, audio de alta resolución y 40 horas de batería continua.",
            price: 289.00,
            stock: 40,
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
            category: "Audio",
            formattedPrice: "Q289.00",
            inStock: true,
          },
        ]);
      }
    };

    fetchProducts();
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-darker text-slate-100 font-sans selection:bg-primary-500/30 selection:text-primary-100 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-900/20 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/30 border border-primary-500/30 text-primary-300 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(217,70,239,0.15)]">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span>Examen Final UMG • Fullstack</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-white leading-[1.1] drop-shadow-sm">
            Catálogo Inteligente de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-300 animate-pulse">
              Productos
            </span>
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
            Plataforma monorepo moderna desarrollada con Spring Boot 3, PostgreSQL, seguridad JWT y una interfaz hiper-dinámica en Next.js.
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-5">
            {isAuthenticated ? (
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-extrabold text-base shadow-[0_0_30px_rgba(217,70,239,0.4)] transition-all hover:scale-105 active:scale-95 border border-primary-400/20"
              >
                <span>Acceder al Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-extrabold text-base shadow-[0_0_30px_rgba(217,70,239,0.4)] transition-all hover:scale-105 active:scale-95 border border-primary-400/20"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="http://localhost:8080/swagger-ui/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-surface-card hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-base transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                >
                  <Code2 className="w-5 h-5 text-slate-400" />
                  <span>API Docs</span>
                </a>
              </>
            )}
          </div>
        </section>

        {/* Carousel Showcase Section */}
        <section className="space-y-6 pt-10">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                <Zap className="w-6 h-6 text-primary-400" />
                <span>Productos Destacados</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-medium">
                Explora el catálogo dinámico de productos activos
              </p>
            </div>
            <span className="text-xs text-primary-300 font-bold uppercase tracking-widest hidden sm:inline px-3 py-1 bg-primary-900/30 rounded-lg border border-primary-500/20">
              Desplazamiento Interactivo
            </span>
          </div>

          <Carousel products={products} onSelectProduct={handleSelectProduct} />
        </section>

        {/* Architecture & Roles Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 pb-10">
          <div className="p-8 rounded-3xl bg-surface-card/60 backdrop-blur-md border border-slate-700/50 hover:border-primary-500/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Seguridad &amp; Roles JWT</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Control de acceso con roles <span className="text-primary-300 font-mono bg-primary-900/50 px-1 rounded">ROLE_ADMIN</span> y <span className="text-secondary-300 font-mono bg-secondary-900/50 px-1 rounded">ROLE_USER</span>.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-surface-card/60 backdrop-blur-md border border-slate-700/50 hover:border-secondary-500/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-secondary-500/10 text-secondary-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Database className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">PostgreSQL &amp; Liquibase</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Evolución de esquema automatizada mediante changelogs versionados y migraciones.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-surface-card/60 backdrop-blur-md border border-slate-700/50 hover:border-emerald-500/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Arquitectura Limpia</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Capas desacopladas en Backend (Repository, Entity, Service) y en Frontend (Next.js BFF).
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 bg-surface-darker relative z-10 text-center">
        <p className="text-sm text-slate-400 font-semibold tracking-wide">Universidad Mariano Gálvez de Guatemala • FIS</p>
        <p className="mt-2 text-xs text-slate-500">Examen Segundo Parcial • Backend Spring Boot 3 + Frontend Next.js</p>
      </footer>

      {/* View Product Modal */}
      <ViewProductModal
        product={selectedProduct}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
}
