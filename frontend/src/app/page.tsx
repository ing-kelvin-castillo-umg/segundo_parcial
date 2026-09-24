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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-14">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10 sm:px-12 sm:py-14 shadow-xl shadow-slate-900/10">
          <div className="absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute -bottom-32 right-1/3 -z-10 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-blue-200">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Universidad Mariano Gálvez de Guatemala · Segundo Parcial</span>
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
                Gestión y catálogo de <span className="text-blue-300">productos</span>
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Un espacio confiable para descubrir productos y mantener el inventario organizado, con acceso seguro para cada perfil.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
            {isAuthenticated ? (
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-blue-400"
              >
                <span>Acceder al Panel Privado</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-blue-400"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
            </div>
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Plataforma UMG</p>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3.5">
                    <ShieldCheck className="h-5 w-5 text-blue-300" />
                    <div><p className="text-sm font-semibold text-white">Acceso protegido</p><p className="text-xs text-slate-400">Roles y sesión segura</p></div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3.5">
                    <Database className="h-5 w-5 text-emerald-300" />
                    <div><p className="text-sm font-semibold text-white">Inventario centralizado</p><p className="text-xs text-slate-400">Catálogo en un solo lugar</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Carousel Showcase Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <span>Productos Destacados</span>
              </h2>
              <p className="text-xs text-slate-500">
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
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 transition hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Seguridad &amp; Roles JWT</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Control de acceso con roles <span className="text-blue-700 font-mono">ROLE_ADMIN</span> y <span className="text-emerald-700 font-mono">ROLE_USER</span>. Permisos diferenciados para consulta y gestión de inventario.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 transition hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">PostgreSQL &amp; Liquibase</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evolución de esquema automatizada mediante changelogs versionados, garantizando la creación de tablas y semillas de datos consistentes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 transition hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Arquitectura Limpia y Mappers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Capas desacopladas en Backend (Repository, Entity, Service e Interfaces, Mappers, DTOs) y en Frontend (DTOs, Entities, Mappers, Services).
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
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
