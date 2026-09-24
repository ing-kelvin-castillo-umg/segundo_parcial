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
    <div className="min-h-screen flex flex-col bg-cream text-brand-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-14 space-y-14">
        {/* Hero Section */}
        <section className="relative text-center space-y-6 max-w-4xl mx-auto rounded-[2rem] px-5 py-12 sm:py-16 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white overflow-hidden shadow-2xl shadow-brand-950/20">
          <div className="absolute -top-20 -right-12 w-64 h-64 rounded-full bg-copper/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-brand-400/30 blur-3xl pointer-events-none" />
          <div className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-100 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universidad Mariano Gálvez de Guatemala • Segundo Parcial</span>
          </div>

          <h1 className="relative text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Productos que inspiran.<br />
            <span className="text-copper">Gestión que fluye.</span>
          </h1>

          <p className="relative text-brand-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Explora el catálogo y administra tu inventario en un solo lugar. Una experiencia clara, rápida y segura para cada producto.
          </p>

          <div className="relative pt-2 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-copper hover:bg-amber-400 text-brand-950 font-bold text-sm shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5"
              >
                <span>Acceder al Panel Privado</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-copper hover:bg-amber-400 text-brand-950 font-bold text-sm shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5"
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
              <h2 className="text-xl sm:text-2xl font-bold text-brand-950 flex items-center gap-2">
                <Zap className="w-5 h-5 text-copper" />
                <span>Productos Destacados</span>
              </h2>
              <p className="text-sm text-brand-800">
                Explora el catálogo dinámico de productos activos
              </p>
            </div>
            <span className="text-xs text-brand-700 hidden sm:inline">
              Desplazamiento automático interactivo
            </span>
          </div>

          <Carousel products={products} onSelectProduct={handleSelectProduct} />
        </section>

        {/* Architecture & Roles Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-6 rounded-2xl bg-white border border-brand-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-950">Acceso según tu rol</h3>
            <p className="text-sm text-brand-800 leading-relaxed">
              Cada usuario ve las herramientas que necesita para consultar o administrar el inventario.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-brand-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-950">Información al día</h3>
            <p className="text-sm text-brand-800 leading-relaxed">
              Consulta disponibilidad, precios y categorías desde un catálogo conectado al inventario.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-brand-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-950">Gestión sencilla</h3>
            <p className="text-sm text-brand-800 leading-relaxed">
              Busca y revisa productos con una interfaz cómoda en computadora, tableta o teléfono.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-100 py-8 text-center text-xs text-brand-700 bg-white">
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
