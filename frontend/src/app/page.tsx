"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Carousel } from "@/components/Carousel";
import { ViewProductModal } from "@/components/ProductModals";
import { Product } from "@/entities/product.entity";
import { ProductService } from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, ShieldCheck, Zap, ArrowRight, Database, Layers, Leaf } from "lucide-react";

const fallbackProducts: Product[] = [
  { id: 1, name: "Laptop Pro 16 Ultra", description: "Portátil de alto rendimiento con procesador de última generación, 32GB RAM y 1TB SSD NVMe.", price: 1499.99, stock: 15, imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80", category: "Computación", formattedPrice: "Q1,499.99", inStock: true },
  { id: 2, name: "Monitor Curvo UltraWide 34", description: "Pantalla curva IPS con resolución WQHD, tasa de refresco de 144Hz y soporte HDR400.", price: 649.5, stock: 25, imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80", category: "Monitores", formattedPrice: "Q649.50", inStock: true },
  { id: 3, name: "Auriculares Studio ANC", description: "Cancelación activa de ruido, audio de alta resolución y 40 horas de batería continua.", price: 289, stock: 40, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", category: "Audio", formattedPrice: "Q289.00", inStock: true },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { isAuthenticated } = useAuth();
  useEffect(() => { ProductService.getAll().then((data) => setProducts(data?.length ? data : fallbackProducts)).catch(() => setProducts(fallbackProducts)); }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-zinc-900">
      <Navbar />
      <main className="relative mx-auto max-w-7xl space-y-16 overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-72 h-96 w-96 rounded-full bg-jade-200/35 blur-3xl" />
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-950 via-brand-900 to-jade-900 px-6 py-14 text-center shadow-2xl shadow-brand-950/20 sm:px-12 sm:py-20">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" /><div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full border border-white/10" />
          <div className="relative mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-300/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-100"><Sparkles className="h-3.5 w-3.5 text-amber-300" />Universidad Mariano Gálvez · Segundo Parcial</div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">Inventario claro.<br /><span className="bg-gradient-to-r from-brand-200 via-jade-200 to-amber-200 bg-clip-text text-transparent">Decisiones más ágiles.</span></h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-brand-100/80 sm:text-lg">Explora un catálogo moderno y administra productos desde un espacio seguro, simple y preparado para el trabajo diario.</p>
            <Link href={isAuthenticated ? "/dashboard/products" : "/login"} className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-amber-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-300"><span>{isAuthenticated ? "Ir al panel privado" : "Iniciar sesión"}</span><ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>

        <section className="relative space-y-5"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-jade-700"><Leaf className="h-4 w-4" />Selección destacada</p><h2 className="text-2xl font-black text-zinc-900">Productos que impulsan tu día</h2></div><p className="text-xs text-stone-500">El carrusel se actualiza automáticamente</p></div><Carousel products={products} onSelectProduct={setSelectedProduct} /></section>

        <section className="relative grid grid-cols-1 gap-5 md:grid-cols-3">
          {[{ icon: ShieldCheck, title: "Acceso confiable", text: "Roles diferenciados y una sesión protegida para cada tipo de usuario.", color: "brand" }, { icon: Database, title: "Datos consistentes", text: "Inventario respaldado por migraciones y una estructura de datos ordenada.", color: "jade" }, { icon: Layers, title: "Diseño organizado", text: "Una experiencia fluida desde el catálogo público hasta la gestión privada.", color: "amber" }].map(({ icon: Icon, title, text, color }) => <article key={title} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-950/5"><div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${color === "brand" ? "bg-brand-50 text-brand-700" : color === "jade" ? "bg-jade-50 text-jade-700" : "bg-amber-50 text-amber-700"}`}><Icon className="h-5 w-5" /></div><h3 className="font-bold text-zinc-900">{title}</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">{text}</p></article>)}
        </section>
      </main>
      <footer className="border-t border-stone-200 bg-white py-8 text-center text-xs text-stone-500"><p className="font-medium text-zinc-700">Universidad Mariano Gálvez de Guatemala · Facultad de Ingeniería en Sistemas</p><p className="mt-1">Examen Segundo Parcial · Spring Boot + Next.js</p></footer>
      <ViewProductModal product={selectedProduct} isOpen={Boolean(selectedProduct)} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
