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
    <div className="min-h-screen flex flex-col bg-aurora-ink text-slate-100 overflow-hidden">
      <Navbar />

      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        <div className="pointer-events-none absolute -top-32 -left-48 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="pointer-events-none absolute top-24 -right-48 h-96 w-96 rounded-full bg-aurora-violet/15 blur-3xl" />
        {/* Hero Section */}
        <section className="relative text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-400/10 border border-brand-300/25 text-brand-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universidad Mariano Gálvez de Guatemala • Segundo Parcial</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Gestión y Catálogo de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-aurora-cyan to-aurora-violet">
              Productos
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Plataforma monorepo moderna desarrollada con Spring Boot (Java 21), PostgreSQL con Liquibase, autenticación basada en JWT con control de roles, y frontend en Next.js con React.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5"
              >
                <span>Acceder al Panel Privado</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Carousel Showcase Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-aurora-amber" />
                <span>Productos Destacados</span>
              </h2>
              <p className="text-xs text-slate-400">
                Explora el catálogo dinámico de productos activos
              </p>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Desplazamiento automático interactivo
            </span>
          </div>

          <Carousel products={products} onSelectProduct={handleSelectProduct} />
        </section>

        {/* Architecture & Roles Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-2xl bg-aurora-panel/70 border border-brand-400/15 space-y-3 shadow-xl shadow-black/10 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-brand-400/10 text-brand-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Seguridad &amp; Roles JWT</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Control de acceso con roles <span className="text-brand-300 font-mono">ROLE_ADMIN</span> y <span className="text-aurora-amber font-mono">ROLE_USER</span>. Permisos diferenciados para consulta y mutación de inventario.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-aurora-panel/70 border border-aurora-violet/20 space-y-3 shadow-xl shadow-black/10 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-aurora-violet/10 text-violet-300 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">PostgreSQL &amp; Liquibase</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evolución de esquema automatizada mediante changelogs versionados, garantizando la creación de tablas y semillas de datos consistentes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-aurora-panel/70 border border-aurora-amber/20 space-y-3 shadow-xl shadow-black/10 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-aurora-amber/10 text-aurora-amber flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Arquitectura Limpia y Mappers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Capas desacopladas en Backend (Repository, Entity, Service e Interfaces, Mappers, DTOs) y en Frontend (DTOs, Entities, Mappers, Services).
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-400/10 py-8 text-center text-xs text-slate-500">
        <p>Universidad Mariano Gálvez de Guatemala • Facultad de Ingeniería en Sistemas</p>
        <p className="mt-1">Examen Segundo Parcial • Backend Spring Boot 3 + Frontend Next.js</p>
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
