"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  Boxes,
  LogOut,
  Home,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout, idleSecondsRemaining } = useAuth();

  const navItems = [
    {
      name: "Productos",
      href: "/dashboard/products",
      icon: Boxes,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-forest-950 text-forest-100 flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-forest-800 md:min-h-screen">
      {/* Brand Header */}
      <div className="px-5 py-4 md:p-6 border-b border-forest-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-mint-600 to-forest-500 flex items-center justify-center text-white shadow-lg shadow-mint-500/20">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-xs text-forest-200">Examen Parcial</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-3 md:py-6 space-y-1.5">
        <p className="hidden md:block px-3 pb-2 text-[11px] font-semibold text-forest-200 uppercase tracking-wider">
          Módulos del Sistema
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-mint-600 text-white shadow-md shadow-mint-600/30"
                  : "text-forest-100 hover:bg-forest-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="hidden md:block pt-4 border-t border-forest-800/80 my-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-forest-200 hover:bg-forest-800 hover:text-white transition-all"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-forest-800 bg-forest-900/50">
        <div className="flex items-center justify-between mb-3 px-2 py-1.5 rounded-lg bg-forest-800 text-[11px] text-forest-100">
          <span>Cierre por inactividad</span>
          <span className="font-mono font-bold text-white" aria-live="off">
            {String(Math.floor(idleSecondsRemaining / 60)).padStart(2, "0")}:{String(idleSecondsRemaining % 60).padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${isAdmin ? "bg-gold-600 ring-2 ring-gold-300" : "bg-mint-600 ring-2 ring-mint-300"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-forest-200 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-gold-500/20 text-gold-200 border border-gold-500/30"
                : "bg-mint-500/20 text-mint-200 border border-mint-500/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <button
          onClick={() => void logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition-colors border border-rose-500/20 hover:border-transparent"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
