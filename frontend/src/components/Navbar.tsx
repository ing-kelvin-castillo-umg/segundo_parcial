"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/15 bg-surface/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-xl group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lift group-hover:bg-primary-dark transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-ink leading-tight">Portal UMG</span>
            <span className="hidden sm:block text-xs text-muted">Segundo Parcial · Catálogo</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/products"
                aria-label="Ir al panel de productos"
                className="focus-ring inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-dark bg-primary-light/70 hover:bg-primary-light rounded-xl transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">Panel de Productos</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-secondary rounded-xl text-xs font-medium text-ink border border-outline/70">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-primary" />
                ) : (
                  <UserIcon className="w-4 h-4 text-success" />
                )}
                <span>{user?.username}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isAdmin ? "bg-primary-light text-primary-dark" : "bg-success/10 text-success"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={logout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="icon-button text-muted hover:text-danger hover:bg-danger/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-primary"
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
