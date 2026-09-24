"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-surface-darker/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-white leading-none tracking-tight">Portal UMG</span>
            <span className="text-xs text-primary-400 font-medium mt-1 uppercase tracking-widest">Segundo Parcial</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-primary-300 bg-primary-900/30 border border-primary-500/20 hover:bg-primary-900/50 hover:text-white rounded-xl transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel de Productos</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900/80 rounded-xl text-xs font-semibold text-slate-300 border border-slate-800">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-primary-400" />
                ) : (
                  <UserIcon className="w-4 h-4 text-secondary-400" />
                )}
                <span>{user?.username}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${isAdmin ? "bg-primary-500/20 text-primary-300" : "bg-secondary-500/20 text-secondary-300"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent rounded-xl transition-all hover:scale-110"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-extrabold text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all hover:scale-105 active:scale-95 border border-primary-400/20"
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
