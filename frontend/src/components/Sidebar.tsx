"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  Boxes,
  LogOut,
  User as UserIcon,
  Home,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    {
      name: "Productos",
      href: "/dashboard/products",
      icon: Boxes,
    },
  ];

  return (
    <aside className="w-20 md:w-64 bg-brand-950 text-brand-100 flex flex-col shrink-0 min-h-screen border-r border-brand-800 transition-all duration-300">
      {/* Brand Header */}
      <div className="p-4 md:p-6 border-b border-brand-800 flex items-center justify-center md:justify-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <Package className="w-5 h-5" />
        </div>
        <div className="hidden md:block">
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-xs text-slate-400">Examen Parcial</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 md:px-4 py-6 space-y-1.5">
        <p className="hidden md:block px-3 pb-2 text-[11px] font-semibold text-brand-200/60 uppercase tracking-wider">
          Módulos del Sistema
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={`flex items-center justify-center md:justify-start gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                  : "text-brand-100/75 hover:bg-brand-900 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden md:block">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-brand-800/80 my-4">
          <Link
            href="/"
            title="Ver Catálogo Público"
            className="flex items-center justify-center md:justify-start gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-brand-200/60 hover:bg-brand-900 hover:text-white transition-all"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="hidden md:block">Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-2 md:p-4 border-t border-brand-800 bg-brand-950/50">
        <div className="hidden md:flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${isAdmin ? "bg-accent-600 ring-2 ring-accent-400" : "bg-emerald-600 ring-2 ring-emerald-400"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <button
          onClick={() => void logout()}
          title="Cerrar sesión"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition-colors border border-rose-500/20 hover:border-transparent"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:block">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
