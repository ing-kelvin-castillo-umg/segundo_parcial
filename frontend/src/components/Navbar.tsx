"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-stone-50/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="Ir al catálogo">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-jade-600 text-white shadow-lg shadow-brand-700/20 transition group-hover:from-brand-700 group-hover:to-jade-700">
            <Package className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight font-bold text-zinc-900">Portal UMG</span>
            <span className="text-xs text-stone-500">Inventario inteligente</span>
          </div>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/dashboard/products" className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800 transition hover:bg-brand-100 sm:px-4">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Panel de productos</span>
            </Link>
            <div className="hidden items-center gap-2 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-medium text-zinc-700 md:flex">
              {isAdmin ? <ShieldCheck className="h-4 w-4 text-jade-600" /> : <UserIcon className="h-4 w-4 text-brand-600" />}
              <span>{user?.username}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${isAdmin ? "bg-jade-100 text-jade-800" : "bg-brand-100 text-brand-800"}`}>{isAdmin ? "ADMIN" : "USER"}</span>
            </div>
            <button onClick={() => void logout()} title="Cerrar sesión" aria-label="Cerrar sesión" className="rounded-xl p-2 text-stone-500 transition hover:bg-rose-50 hover:text-rose-700">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-700/20 transition hover:bg-brand-800 hover:shadow-md">
            <LogIn className="h-4 w-4" />
            <span>Iniciar sesión</span>
          </Link>
        )}
      </div>
    </header>
  );
};
