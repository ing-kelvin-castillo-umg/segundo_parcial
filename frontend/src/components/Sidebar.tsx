"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  Boxes,
  LogOut,
  ShieldAlert,
  User as UserIcon,
  Home,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  // En pantallas pequeñas el menú se muestra como panel deslizable.
  const [mobileOpen, setMobileOpen] = useState(false);

  // Al navegar se cierra el panel para no tapar el contenido.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    {
      name: "Resumen",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Productos",
      href: "/dashboard/products",
      icon: Boxes,
      exact: false,
    },
  ];

  return (
    <>
      {/* Botón de menú, visible solo en pantallas pequeñas */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú de navegación"
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-surface-900 text-white border border-surface-700 shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Fondo oscurecido al abrir el menú en móvil */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-surface-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`w-64 bg-surface-900 text-surface-200 flex flex-col shrink-0 min-h-screen border-r border-surface-800 fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      {/* Brand Header */}
      <div className="p-6 border-b border-surface-800 flex items-center gap-3 relative">
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú de navegación"
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-xs text-surface-400">Examen Parcial</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="px-3 pb-2 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
          Módulos del Sistema
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                  : "text-surface-300 hover:bg-surface-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-surface-800/80 my-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:bg-surface-800 hover:text-white transition-all"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-surface-800 bg-surface-950/50">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${isAdmin ? "bg-accent-600 ring-2 ring-accent-400" : "bg-success-600 ring-2 ring-success-400"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-surface-400 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                : "bg-success-500/20 text-success-300 border border-success-500/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <button
          onClick={() => logout("manual")}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-danger-400 hover:text-white bg-danger-500/10 hover:bg-danger-600 rounded-lg transition-colors border border-danger-500/20 hover:border-transparent"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
      </aside>
    </>
  );
};
