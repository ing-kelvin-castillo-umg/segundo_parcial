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
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 w-72 md:w-64 bg-surface-darker text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800/80 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base tracking-tight leading-none">
                UMG Dashboard
              </h2>
              <span className="text-[11px] text-primary-400 font-bold uppercase tracking-widest mt-0.5 inline-block">Examen Parcial</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Módulos del Sistema
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-500/30"
                    : "text-slate-400 hover:bg-surface-card hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800/50 my-4">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-surface-card hover:text-white transition-all"
            >
              <Home className="w-5 h-5 shrink-0" />
              <span>Ver Catálogo Público</span>
            </Link>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner ${isAdmin ? "bg-primary-600 ring-2 ring-primary-400/50" : "bg-secondary-600 ring-2 ring-secondary-400/50"}`}>
                {user?.username?.slice(0, 2).toUpperCase() || "US"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  @{user?.username}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-1 rounded-md text-[9px] font-black shrink-0 uppercase tracking-widest ${
                isAdmin
                  ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                  : "bg-secondary-500/20 text-secondary-300 border border-secondary-500/30"
              }`}
            >
              {isAdmin ? "Admin" : "User"}
            </span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl transition-all border border-rose-500/20 hover:border-rose-500 hover:shadow-[0_0_15px_rgba(225,29,72,0.4)]"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
