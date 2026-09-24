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
  Boxes,
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative -mt-16 pt-16 overflow-hidden bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-900 text-white">
          {/* Decoración */}
          <div className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-primary-500/20 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-40 -left-24 w-[26rem] h-[26rem] rounded-full bg-accent-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgb(255 255 255) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
            aria-hidden="true"
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
            <div className="max-w-3xl mx-auto text-center space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-secondary-100 text-xs font-semibold tracking-wide backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-accent-400" aria-hidden="true" />
                <span>Universidad Mariano Gálvez de Guatemala · Segundo Parcial</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Gestión y Catálogo de <span className="text-accent-400">Productos</span>
              </h1>

              <p className="text-secondary-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                Plataforma monorepo con Spring Boot (Java 21), PostgreSQL con Liquibase, autenticación JWT con
                roles y refresh token, y un frontend en Next.js que actúa como BFF.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                {isAuthenticated ? (
                  <Link href="/dashboard/products" className="btn btn-accent px-6 py-3 text-base">
                    <span>Acceder al Panel Privado</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <Link href="/login" className="btn btn-accent px-6 py-3 text-base">
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                )}
                <a
                  href="#catalogo"
                  className="btn px-6 py-3 text-base text-white border border-white/25 hover:bg-white/10 hover:border-white/40"
                >
                  <Boxes className="w-4 h-4" aria-hidden="true" />
                  <span>Ver Catálogo</span>
                </a>
              </div>

              <ul className="pt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Tecnologías">
                {TECH_STACK.map((tech) => (
                  <li
                    key={tech}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-secondary-200"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Catálogo */}
        <section id="catalogo" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-700 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-accent-600" aria-hidden="true" />
                Catálogo
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Productos Destacados
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explora el catálogo dinámico de productos activos.
              </p>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Usa las flechas del teclado o desliza en móvil
            </p>
          </div>

          <Carousel products={products} onSelectProduct={handleSelectProduct} />
        </section>

        {/* Arquitectura */}
        <section className="bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-700">Arquitectura</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Construido por capas, seguro por diseño
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, body, tone }) => (
                <article
                  key={title}
                  className="card p-6 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary-900 text-secondary-200 py-8 text-center text-xs">
        <p>Universidad Mariano Gálvez de Guatemala · Facultad de Ingeniería en Sistemas</p>
        <p className="mt-1 text-secondary-300">Examen Segundo Parcial · Backend Spring Boot 3 + Frontend Next.js</p>
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

const TECH_STACK = ["Spring Boot 3", "Java 21", "PostgreSQL", "Liquibase", "JWT + Refresh", "Next.js 14", "Tailwind CSS"];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Seguridad & Roles JWT",
    body: "Control de acceso con ROLE_ADMIN y ROLE_USER, access token de corta duración, refresh token rotativo y cierre por inactividad.",
    tone: "bg-primary-50 text-primary-700",
  },
  {
    icon: Database,
    title: "PostgreSQL & Liquibase",
    body: "Evolución de esquema automatizada mediante changelogs versionados, con tablas y semillas de datos consistentes.",
    tone: "bg-accent-100 text-accent-800",
  },
  {
    icon: Layers,
    title: "Arquitectura Limpia y Mappers",
    body: "Capas desacopladas en backend (Controller, Service, Repository, DTOs, Mappers) y frontend (DTOs, Entities, Mappers, Services).",
    tone: "bg-secondary-100 text-secondary-800",
  },
];
