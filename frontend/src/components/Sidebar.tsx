"use client";

import React from "react";
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
    <aside className="w-20 lg:w-64 bg-gradient-to-b from-emerald-950 to-stone-950 text-stone-200 flex flex-col shrink-0 min-h-screen border-r border-emerald-900/70 shadow-xl shadow-black/10">
      {/* Brand Header */}
      <div className="p-4 lg:p-6 border-b border-emerald-900/70 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-emerald-950 shadow-lg shadow-emerald-950/40 ring-1 ring-white/20 shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div className="hidden lg:block">
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-xs text-emerald-200/70">Examen Parcial</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 lg:px-4 py-6 space-y-1.5">
        <p className="hidden lg:block px-3 pb-2 text-[11px] font-semibold text-emerald-200/60 uppercase tracking-wider">
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
              className={`flex items-center justify-center lg:justify-start gap-3 px-3.5 py-3 lg:py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-300/30"
                  : "text-stone-300 hover:bg-emerald-900/60 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:inline">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-emerald-900/70 my-4">
          <Link
            href="/"
            title="Ver Catálogo Público"
            className="flex items-center justify-center lg:justify-start gap-3 px-3.5 py-3 lg:py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:bg-emerald-900/60 hover:text-white transition-all"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline">Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 lg:p-4 border-t border-emerald-900/70 bg-stone-950/50">
        <div className="hidden lg:flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${isAdmin ? "bg-amber-400 text-stone-950 ring-2 ring-amber-200" : "bg-emerald-600 text-white ring-2 ring-emerald-400"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-stone-400 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <button
          onClick={() => void logout("MANUAL")}
          title="Cerrar Sesión"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition-colors border border-rose-500/20 hover:border-transparent"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
