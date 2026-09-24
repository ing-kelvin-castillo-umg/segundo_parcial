"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  LogIn,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Menu,
  X,
  Code2,
  Boxes,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/#catalogo", label: "Catálogo", icon: Boxes, external: false },
  { href: "/swagger-ui/index.html", label: "API Docs", icon: Code2, external: true },
];

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Más opaco al hacer scroll para mantener el contraste sobre el contenido claro.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const roleBadge = (
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${
        isAdmin ? "bg-accent text-accent-foreground" : "bg-primary-100 text-primary-800"
      }`}
    >
      {isAdmin ? "ADMIN" : "USER"}
    </span>
  );

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 backdrop-blur-lg ${
        scrolled || menuOpen
          ? "bg-secondary-900/95 border-white/10 shadow-lg shadow-secondary-950/20"
          : "bg-secondary-900/75 border-white/5"
      }`}
    >
      <nav
        aria-label="Navegación principal"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4"
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group rounded-xl" onClick={closeMenu}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-md shadow-primary-900/40 group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg text-white leading-tight">Portal UMG</span>
            <span className="text-[11px] sm:text-xs text-secondary-200">Segundo Parcial · Catálogo</span>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon, external }) => (
            <a
              key={href}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-secondary-100 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </a>
          ))}

          <span className="mx-2 h-6 w-px bg-white/15" aria-hidden="true" />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium text-white">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-accent-400" aria-hidden="true" />
                ) : (
                  <UserIcon className="w-4 h-4 text-primary-300" aria-hidden="true" />
                )}
                <span className="max-w-[8rem] truncate">{user?.username}</span>
                {roleBadge}
              </div>
              <Link href="/dashboard/products" className="btn btn-accent">
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                <span>Panel</span>
              </Link>
              <button
                onClick={() => void logout("MANUAL")}
                aria-label="Cerrar sesión"
                className="tooltip-trigger p-2.5 rounded-lg text-secondary-100 hover:text-white hover:bg-danger-600 transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span className="tooltip tooltip-below" role="tooltip">Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-accent">
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          {menuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-white/10 animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {isAuthenticated && (
              <div className="flex items-center gap-2 px-3 py-2.5 mb-2 rounded-xl bg-white/10 text-sm text-white">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-accent-400" aria-hidden="true" />
                ) : (
                  <UserIcon className="w-4 h-4 text-primary-300" aria-hidden="true" />
                )}
                <span className="font-medium truncate">{user?.fullName || user?.username}</span>
                <span className="ml-auto">{roleBadge}</span>
              </div>
            )}

            {NAV_LINKS.map(({ href, label, icon: Icon, external }) => (
              <a
                key={href}
                href={href}
                onClick={closeMenu}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-secondary-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                {label}
              </a>
            ))}

            <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard/products" onClick={closeMenu} className="btn btn-accent w-full">
                    <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                    <span>Ir al Panel de Productos</span>
                  </Link>
                  <button
                    onClick={() => {
                      closeMenu();
                      void logout("MANUAL");
                    }}
                    className="btn w-full text-danger-200 border border-danger-500/40 hover:bg-danger-600 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={closeMenu} className="btn btn-accent w-full">
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  <span>Iniciar Sesión</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
