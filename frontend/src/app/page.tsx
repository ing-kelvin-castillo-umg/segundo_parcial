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
        setProducts([
          {
            id: 1,
            name: "Laptop Pro 16 Ultra",
            description: "Portatil de alto rendimiento con procesador de ultima generacion, 32GB RAM y 1TB SSD NVMe.",
            price: 1499.99,
            stock: 15,
            imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
            category: "Computacion",
            formattedPrice: "Q1,499.99",
            inStock: true,
          },
          {
            id: 2,
            name: "Monitor Curvo UltraWide 34",
            description: "Pantalla curva IPS con resolucion WQHD, tasa de refresco de 144Hz y soporte HDR400.",
            price: 649.50,
            stock: 25,
            imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
            category: "Monitores",
            formattedPrice: "Q649.50",
            inStock: true,
          },
          {
            id: 3,
            name: "Auriculares Inalambricos Studio ANC",
            description: "Cancelacion activa de ruido hibrida, audio de alta resolucion y 40 horas de bateria continua.",
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
    <div className="min-h-screen flex flex-col bg-ink-50 text-ink-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
        <section className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 border border-brand-200 text-brand-800 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universidad Mariano Galvez de Guatemala - Segundo Parcial</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-ink-950 leading-tight">
            Gestion y Catalogo de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-coral-500 to-harvest-500">
              Productos
            </span>
          </h1>

          <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
            Plataforma monorepo con Spring Boot, PostgreSQL, Liquibase, JWT con refresh token, cierre por inactividad y frontend Next.js protegido por proxy BFF.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-lg shadow-brand-700/25 transition-all hover:scale-105"
              >
                <span>Acceder al Panel Privado</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-lg shadow-brand-700/25 transition-all hover:scale-105"
                >
                  <span>Iniciar Sesion</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="/swagger-ui/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white hover:bg-ink-100 text-ink-700 border border-ink-200 font-medium text-sm transition-all"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Documentacion Swagger API</span>
                </a>
              </>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink-950 flex items-center gap-2">
                <Zap className="w-5 h-5 text-harvest-500" />
                <span>Productos Destacados</span>
              </h2>
              <p className="text-xs text-ink-500">
                Explora el catalogo dinamico de productos activos
              </p>
            </div>
            <span className="text-xs text-ink-500 hidden sm:inline">
              Desplazamiento automatico interactivo
            </span>
          </div>

          <Carousel products={products} onSelectProduct={handleSelectProduct} />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-lg bg-white/80 border border-ink-200 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-ink-950">Seguridad y Roles JWT</h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              Control de acceso con roles <span className="text-coral-700 font-mono">ROLE_ADMIN</span> y <span className="text-brand-700 font-mono">ROLE_USER</span>. Permisos diferenciados para consulta y mutacion de inventario.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-white/80 border border-ink-200 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-harvest-100 text-harvest-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-ink-950">PostgreSQL y Liquibase</h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              Evolucion de esquema automatizada mediante changelogs versionados, garantizando tablas y semillas consistentes.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-white/80 border border-ink-200 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-coral-100 text-coral-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-ink-950">Arquitectura Limpia</h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              Capas desacopladas en backend y frontend con DTOs, entities, mappers y servicios para mantener el codigo legible.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-200 py-8 text-center text-xs text-ink-500 bg-white/40">
        <p>Universidad Mariano Galvez de Guatemala - Facultad de Ingenieria en Sistemas</p>
        <p className="mt-1">Examen Segundo Parcial - Backend Spring Boot 3 + Frontend Next.js</p>
      </footer>

      <ViewProductModal
        product={selectedProduct}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
}
