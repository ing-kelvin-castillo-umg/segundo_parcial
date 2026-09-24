"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-forest-700 bg-forest-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-mint-500 flex items-center justify-center text-forest-950 shadow-md shadow-mint-500/20 group-hover:bg-mint-400 transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white leading-tight">Portal UMG</span>
            <span className="text-xs text-forest-200">Segundo Parcial - Catálogo</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-mint-200 bg-mint-500/15 hover:bg-mint-500/25 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel de Productos</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-forest-800 rounded-lg text-xs font-medium text-forest-100">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-gold-300" />
                ) : (
                  <UserIcon className="w-4 h-4 text-mint-300" />
                )}
                <span>{user?.username}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isAdmin ? "bg-gold-200 text-gold-800" : "bg-mint-200 text-mint-800"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={() => void logout()}
                title="Cerrar sesión"
                className="p-2 text-forest-200 hover:text-rose-300 hover:bg-rose-500/15 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-forest-950 bg-mint-400 hover:bg-mint-300 rounded-lg shadow-sm shadow-mint-600/20 transition-all hover:shadow-md"
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
