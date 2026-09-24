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
    <div className="min-h-screen flex flex-col bg-[#102f2b] text-[#f8fbf8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16856f]/20 border border-[#43b995]/40 text-[#9ce0c5] text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universidad Mariano Gálvez de Guatemala • Segundo Parcial</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Gestión y Catálogo de{" "}
            <span className="text-[#f2b84b]">
              Productos
            </span>
          </h1>

          <p className="text-[#c5d8d0] text-base sm:text-lg leading-relaxed">
            Plataforma monorepo moderna desarrollada con Spring Boot (Java 21), PostgreSQL con Liquibase, autenticación basada en JWT con control de roles, y frontend en Next.js con React.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#16856f] hover:bg-[#43b995] text-white font-semibold text-sm shadow-lg shadow-[#16856f]/30 transition-all hover:scale-105"
              >
                <span>Acceder al Panel Privado</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#16856f] hover:bg-[#43b995] text-white font-semibold text-sm shadow-lg shadow-[#16856f]/30 transition-all hover:scale-105"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="/swagger-ui/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#183d37] hover:bg-[#24564c] text-[#e7f1eb] border border-[#3e6c5d] font-medium text-sm transition-all"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Documentación Swagger API</span>
                </a>
              </>
            )}
          </div>
        </section>

        {/* Carousel Showcase Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#f2b84b]" />
                <span>Productos Destacados</span>
              </h2>
              <p className="text-xs text-[#a9c8bb]">
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
          <div className="p-6 rounded-2xl bg-[#183d37] border border-[#356354] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#16856f]/20 text-[#8fe0bf] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Seguridad &amp; Roles JWT</h3>
            <p className="text-xs text-[#c5d8d0] leading-relaxed">
              Control de acceso con roles <span className="text-blue-300 font-mono">ROLE_ADMIN</span> y <span className="text-emerald-300 font-mono">ROLE_USER</span>. Permisos diferenciados para consulta y mutación de inventario.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#183d37] border border-[#356354] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#f2b84b]/15 text-[#f2b84b] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">PostgreSQL &amp; Liquibase</h3>
            <p className="text-xs text-[#c5d8d0] leading-relaxed">
              Evolución de esquema automatizada mediante changelogs versionados, garantizando la creación de tablas y semillas de datos consistentes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#183d37] border border-[#356354] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#16856f]/20 text-[#8fe0bf] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Arquitectura Limpia y Mappers</h3>
            <p className="text-xs text-[#c5d8d0] leading-relaxed">
              Capas desacopladas en Backend (Repository, Entity, Service e Interfaces, Mappers, DTOs) y en Frontend (DTOs, Entities, Mappers, Services).
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#356354] py-8 text-center text-xs text-[#9bb8aa]">
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
