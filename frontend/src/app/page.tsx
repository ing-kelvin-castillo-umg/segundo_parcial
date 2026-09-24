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

  // Cifras reales del catalogo mostradas en la franja de estadisticas
  const totalCategories = new Set(products.map((p) => p.category)).size;
  const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-navy-100 relative overflow-x-hidden">
      {/* Resplandores decorativos de fondo */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full bg-electric-600/25 blur-3xl" />
      <div className="pointer-events-none absolute top-[420px] -right-40 w-[420px] h-[420px] rounded-full bg-turquoise-500/10 blur-3xl" />

      <Navbar />

      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-14 sm:space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-turquoise-400/10 border border-turquoise-300/25 text-turquoise-200 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universidad Mariano Gálvez de Guatemala • Segundo Parcial</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Gestión y Catálogo de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-turquoise-300 via-sky-300 to-electric-400">
              Productos
            </span>
          </h1>

          <p className="text-navy-300 text-base sm:text-lg leading-relaxed">
            Plataforma monorepo moderna desarrollada con Spring Boot (Java 21), PostgreSQL con Liquibase, autenticación basada en JWT con control de roles, y frontend en Next.js con React.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-500 hover:bg-electric-400 text-white font-semibold text-sm shadow-glow transition-all hover:-translate-y-0.5"
              >
                <span>Acceder al Panel Privado</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-500 hover:bg-electric-400 text-white font-semibold text-sm shadow-glow transition-all hover:-translate-y-0.5"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="/swagger-ui/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-navy-100 border border-white/15 font-medium text-sm transition-all"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Documentación Swagger API</span>
                </a>
              </>
            )}
          </div>
        </section>

        {/* Franja de estadisticas del catalogo (datos reales) */}
        <section className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto">
          {[
            { label: "Productos", value: products.length },
            { label: "Categorías", value: totalCategories },
            { label: "Unidades en stock", value: totalUnits },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur px-3 py-4 sm:py-5 text-center">
              <p className="text-2xl sm:text-4xl font-black text-white tabular-nums">{stat.value}</p>
              <p className="text-[11px] sm:text-xs font-medium text-turquoise-300 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Carousel Showcase Section */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-turquoise-300" />
                <span>Productos Destacados</span>
              </h2>
              <p className="text-sm text-navy-300 mt-0.5">
                Explora el catálogo dinámico de productos activos
              </p>
            </div>
            <span className="text-xs text-navy-400 hidden sm:inline">
              Desplazamiento automático interactivo
            </span>
          </div>

          <Carousel products={products} onSelectProduct={handleSelectProduct} />
        </section>

        {/* Architecture & Roles Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-electric-400/40 hover:bg-white/[0.07] transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-electric-500/15 text-electric-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Seguridad &amp; Roles JWT</h3>
            <p className="text-sm text-navy-300 leading-relaxed">
              Control de acceso con roles <span className="text-electric-300 font-mono">ROLE_ADMIN</span> y <span className="text-turquoise-300 font-mono">ROLE_USER</span>. Permisos diferenciados para consulta y mutación de inventario.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-electric-400/40 hover:bg-white/[0.07] transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-400/15 text-indigo-300 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">PostgreSQL &amp; Liquibase</h3>
            <p className="text-sm text-navy-300 leading-relaxed">
              Evolución de esquema automatizada mediante changelogs versionados, garantizando la creación de tablas y semillas de datos consistentes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-turquoise-300/40 hover:bg-white/[0.07] transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-turquoise-400/15 text-turquoise-300 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Arquitectura Limpia y Mappers</h3>
            <p className="text-sm text-navy-300 leading-relaxed">
              Capas desacopladas en Backend (Repository, Entity, Service e Interfaces, Mappers, DTOs) y en Frontend (DTOs, Entities, Mappers, Services).
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-8 px-4 text-center text-xs text-navy-400">
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
