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
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    {
      name: "Productos",
      href: "/dashboard/products",
      icon: Boxes,
    },
  ];

  return (
    <aside className="w-64 bg-ink-950 text-ink-100 flex flex-col shrink-0 min-h-screen border-r border-ink-800">
      <div className="p-6 border-b border-ink-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-xs text-ink-300">Examen Parcial</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="px-3 pb-2 text-[11px] font-semibold text-ink-400 uppercase tracking-wider">
          Modulos del Sistema
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                  : "text-ink-200 hover:bg-ink-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-ink-800/80 my-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-ink-300 hover:bg-ink-800 hover:text-white transition-all"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Ver Catalogo Publico</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-ink-800 bg-ink-900/70">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${isAdmin ? "bg-coral-600 ring-2 ring-coral-300" : "bg-brand-600 ring-2 ring-brand-300"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-ink-300 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-coral-500/20 text-coral-200 border border-coral-500/30"
                : "bg-brand-500/20 text-brand-200 border border-brand-500/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-coral-200 hover:text-white bg-coral-500/10 hover:bg-coral-600 rounded-lg transition-colors border border-coral-500/20 hover:border-transparent"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesion</span>
        </button>
      </div>
    </aside>
  );
};
