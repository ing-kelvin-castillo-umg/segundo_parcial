"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-harbor-100 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-harbor-700 flex items-center justify-center text-white shadow-md shadow-harbor-900/20 group-hover:bg-harbor-600 transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-harbor-950 leading-tight">Portal UMG</span>
            <span className="text-xs text-harbor-700">Segundo Parcial - Catálogo</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-harbor-800 bg-harbor-50 hover:bg-harbor-100 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel de Productos</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-harbor-50 rounded-lg text-xs font-medium text-harbor-800">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-coral-600" />
                ) : (
                  <UserIcon className="w-4 h-4 text-harbor-600" />
                )}
                <span>{user?.username}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isAdmin ? "bg-coral-100 text-coral-700" : "bg-harbor-100 text-harbor-700"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-2 text-harbor-600 hover:text-coral-700 hover:bg-coral-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-coral-500 hover:bg-coral-600 rounded-lg shadow-sm shadow-coral-900/20 transition-all hover:shadow-md hover:shadow-coral-900/30"
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
