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
    <aside className="w-20 lg:w-64 bg-aurora-ink text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-brand-400/10 shadow-2xl shadow-slate-950/20 transition-[width]">
      {/* Brand Header */}
      <div className="p-5 lg:p-6 border-b border-brand-400/10 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-aurora-violet flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <Package className="w-5 h-5" />
        </div>
        <div className="hidden lg:block">
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-xs text-slate-400">Examen Parcial</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="hidden lg:block px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Módulos del Sistema
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-center lg:justify-start gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20"
                  : "text-slate-300 hover:bg-brand-400/10 hover:text-brand-200"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:inline">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-brand-400/10 my-4">
          <Link
            href="/"
            className="flex items-center justify-center lg:justify-start gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-brand-400/10 hover:text-brand-200 transition-all"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline">Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 lg:p-4 border-t border-brand-400/10 bg-black/10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${isAdmin ? "bg-aurora-violet ring-2 ring-violet-300" : "bg-brand-600 ring-2 ring-brand-300"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="hidden lg:block truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`hidden lg:inline px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-aurora-violet/20 text-violet-200 border border-violet-400/30"
                : "bg-brand-500/20 text-brand-200 border border-brand-400/30"
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
          <span className="hidden lg:inline">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
