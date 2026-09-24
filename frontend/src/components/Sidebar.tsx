"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  Boxes,
  LogOut,
  Home,
  Menu,
  X,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false); // menú desplegable en pantallas pequeñas

  const navItems = [
    {
      name: "Productos",
      href: "/dashboard/products",
      icon: Boxes,
    },
  ];

  const brand = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-500 to-turquoise-400 flex items-center justify-center text-white shadow-glow shrink-0">
        <Package className="w-5 h-5" />
      </div>
      <div>
        <h2 className="font-bold text-white text-base tracking-tight leading-none">UMG Dashboard</h2>
        <span className="text-xs text-navy-300">Examen Parcial</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Barra superior (solo móvil / tablet) */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-navy-900 border-b border-white/10 text-white">
        {brand}
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="p-2 rounded-lg text-navy-200 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Fondo oscuro del menú móvil */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:translate-x-0 lg:z-30 bg-gradient-to-b from-navy-900 to-navy-950 text-navy-100 flex flex-col shrink-0 border-r border-white/5 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          {brand}
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="lg:hidden p-1.5 rounded-lg text-navy-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold text-navy-400 uppercase tracking-wider">
            Módulos del Sistema
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-electric-500 text-white shadow-glow"
                    : "text-navy-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-white/10 my-4">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <Home className="w-5 h-5 shrink-0" />
              <span>Ver Catálogo Público</span>
            </Link>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ring-2 ${
                  isAdmin ? "bg-electric-600 ring-electric-300" : "bg-turquoise-600 ring-turquoise-300"
                }`}
              >
                {user?.username?.slice(0, 2).toUpperCase() || "US"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.fullName || user?.username}</p>
                <p className="text-[11px] text-navy-300 truncate">@{user?.username}</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
                isAdmin
                  ? "bg-electric-500/20 text-electric-200 border border-electric-400/30"
                  : "bg-turquoise-400/15 text-turquoise-200 border border-turquoise-400/30"
              }`}
            >
              {isAdmin ? "Admin" : "User"}
            </span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl transition-colors border border-rose-400/20 hover:border-transparent"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
