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
    <aside className="w-64 bg-lagoon-950 text-lagoon-100 flex flex-col shrink-0 min-h-screen border-r border-lagoon-900">
      {/* Brand Header */}
      <div className="p-6 border-b border-lagoon-900 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-lagoon-400 flex items-center justify-center text-lagoon-950 shadow-lg shadow-black/20">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-xs text-lagoon-200/70">Examen Parcial</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="px-3 pb-2 text-[11px] font-semibold text-lagoon-200/65 uppercase tracking-wider">
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
                  ? "bg-lagoon-500 text-white shadow-md shadow-black/20"
                  : "text-lagoon-100/80 hover:bg-lagoon-900 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-lagoon-900/80 my-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-lagoon-100/70 hover:bg-lagoon-900 hover:text-white transition-all"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-lagoon-900 bg-black/10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${isAdmin ? "bg-lagoon-500 ring-2 ring-lagoon-300" : "bg-emerald-600 ring-2 ring-emerald-400"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-lagoon-100/60 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-lagoon-400/15 text-lagoon-100 border border-lagoon-300/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition-colors border border-rose-500/20 hover:border-transparent"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
