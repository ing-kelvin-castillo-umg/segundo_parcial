"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Package, Boxes, LogOut, Home, X } from "lucide-react";

interface SidebarProps {
  /** Solo en móvil: el sidebar se muestra como drawer cuando está abierto. */
  open?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [{ name: "Productos", href: "/dashboard/products", icon: Boxes }];

export const Sidebar: React.FC<SidebarProps> = ({ open = false, onClose }) => {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  // Cerrar el drawer con Escape y bloquear el scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const linkBase =
    "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors focus-visible:ring-offset-secondary-900";

  return (
    <>
      {/* Backdrop (móvil) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 z-40 bg-secondary-950/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        id="dashboard-sidebar"
        aria-label="Menú del panel"
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-64 flex flex-col shrink-0 bg-secondary-900 text-secondary-100
          transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto
          ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        {/* Marca */}
        <div className="h-16 lg:h-auto px-5 lg:p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-900/40">
            <Package className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-base tracking-tight leading-none">UMG Dashboard</p>
            <span className="text-xs text-secondary-300">Examen Parcial</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="lg:hidden p-2 -mr-2 rounded-lg text-secondary-200 hover:text-white hover:bg-white/10 focus-visible:ring-offset-secondary-900"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold text-secondary-300 uppercase tracking-wider">
            Módulos del Sistema
          </p>

          {NAV_ITEMS.map(({ name, href, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={name}
                href={href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`${linkBase} ${
                  isActive
                    ? "bg-primary-700 text-white shadow-md shadow-secondary-950/40"
                    : "text-secondary-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-accent-400" aria-hidden="true" />
                )}
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{name}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/10">
            <Link href="/" onClick={onClose} className={`${linkBase} text-secondary-200 hover:bg-white/10 hover:text-white`}>
              <Home className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Ver Catálogo Público</span>
            </Link>
          </div>
        </nav>

        {/* Perfil */}
        <div className="p-4 border-t border-white/10 bg-secondary-950/50">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ring-2 ${
                  isAdmin
                    ? "bg-accent text-accent-foreground ring-accent-300/60"
                    : "bg-primary-600 text-white ring-primary-300/60"
                }`}
                aria-hidden="true"
              >
                {user?.username?.slice(0, 2).toUpperCase() || "US"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.fullName || user?.username}</p>
                <p className="text-[11px] text-secondary-300 truncate">@{user?.username}</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide border ${
                isAdmin
                  ? "bg-accent-500/15 text-accent-300 border-accent-400/30"
                  : "bg-primary-500/15 text-primary-200 border-primary-400/30"
              }`}
            >
              {isAdmin ? "Admin" : "User"}
            </span>
          </div>

          <button
            onClick={() => void logout("MANUAL")}
            className="btn btn-sm w-full py-2 text-danger-200 bg-danger-500/10 border border-danger-400/30 hover:bg-danger-600 hover:text-white hover:border-transparent focus-visible:ring-offset-secondary-900"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
