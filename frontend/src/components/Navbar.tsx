"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink-200 bg-ink-50/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-700/20 group-hover:bg-brand-800 transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-ink-900 leading-tight">Portal UMG</span>
            <span className="text-xs text-ink-500">Segundo Parcial - Catalogo</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-800 bg-brand-100 hover:bg-brand-200 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel de Productos</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/80 border border-ink-200 rounded-lg text-xs font-medium text-ink-700">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-coral-600" />
                ) : (
                  <UserIcon className="w-4 h-4 text-brand-600" />
                )}
                <span>{user?.username}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isAdmin ? "bg-coral-100 text-coral-700" : "bg-brand-100 text-brand-700"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={logout}
                title="Cerrar sesion"
                className="p-2 text-ink-500 hover:text-coral-700 hover:bg-coral-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-sm shadow-brand-700/20 transition-all hover:shadow-md hover:shadow-brand-700/30"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesion</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
