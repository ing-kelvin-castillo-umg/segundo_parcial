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
    <aside className="w-full lg:w-64 bg-dark-background text-dark-text flex flex-col shrink-0 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-primary-medium/20">
      {/* Brand Header */}
      <div className="p-4 lg:p-6 border-b border-primary-medium/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-medium flex items-center justify-center text-white shadow-lift">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-xs text-dark-muted/65">Examen Parcial</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-3 lg:py-6 lg:space-y-1.5">
        <p className="hidden lg:block px-3 pb-2 text-[11px] font-semibold text-dark-muted/60 uppercase tracking-wider">
          Módulos del Sistema
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`focus-ring flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lift"
                  : "text-dark-muted/80 hover:bg-dark-surface hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="hidden lg:block pt-4 border-t border-primary-medium/15 my-4">
          <Link
            href="/"
            className="focus-ring flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-dark-muted/65 hover:bg-dark-surface hover:text-white transition-all"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 lg:p-4 border-t border-primary-medium/15 bg-black/10">
        <div className="hidden lg:flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${isAdmin ? "bg-primary ring-2 ring-primary-medium" : "bg-success ring-2 ring-green-300"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-dark-muted/60 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-primary-medium/15 text-dark-muted border border-primary-medium/30"
                : "bg-success/15 text-green-200 border border-success/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <button
          onClick={logout}
          className="focus-ring w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-200 hover:text-white bg-danger/15 hover:bg-danger rounded-xl transition-colors border border-danger/30 hover:border-transparent"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
