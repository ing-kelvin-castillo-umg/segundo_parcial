"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-navy-950/85 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-500 to-turquoise-400 flex items-center justify-center text-white shadow-glow shrink-0 group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-lg text-white leading-tight tracking-tight">Portal UMG</span>
            <span className="hidden sm:block text-xs text-navy-300">Segundo Parcial · Catálogo</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-electric-500 hover:bg-electric-400 rounded-xl shadow-sm transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Panel de Productos</span>
                <span className="sm:hidden">Panel</span>
              </Link>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-navy-100">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-electric-300" />
                ) : (
                  <UserIcon className="w-4 h-4 text-turquoise-300" />
                )}
                <span>{user?.username}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isAdmin ? "bg-electric-500/25 text-electric-200" : "bg-turquoise-400/20 text-turquoise-200"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={logout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="p-2.5 text-navy-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-electric-500 hover:bg-electric-400 rounded-xl shadow-glow transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
