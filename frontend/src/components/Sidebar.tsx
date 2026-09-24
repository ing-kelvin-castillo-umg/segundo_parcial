"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Package, Boxes, LogOut, User as UserIcon, Home, Clock3, AlertTriangle, Menu, X } from "lucide-react";
import { formatSessionTime } from "@/config/session";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout, remainingSeconds, isInactivityWarning } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} aria-label="Abrir menú" className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-800 text-white shadow-lg shadow-brand-950/20 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>
      {isOpen && <button aria-label="Cerrar menú" onClick={close} className="fixed inset-0 z-30 bg-zinc-950/45 backdrop-blur-[2px] lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-gradient-to-b from-brand-950 via-brand-900 to-jade-950 text-brand-50 shadow-2xl transition-transform duration-300 lg:static lg:min-h-screen lg:translate-x-0 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 border-b border-white/10 p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-jade-400 text-brand-950 shadow-lg shadow-brand-950/30"><Package className="h-5 w-5" /></div>
          <div className="flex-1"><h2 className="font-bold text-white">UMG Dashboard</h2><span className="text-xs text-brand-200">Centro de inventario</span></div>
          <button onClick={close} aria-label="Cerrar menú" className="rounded-lg p-1 text-brand-100 hover:bg-white/10 lg:hidden"><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-300">Navegación</p>
          <Link href="/dashboard/products" onClick={close} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${pathname.startsWith("/dashboard/products") ? "bg-white text-brand-900 shadow-lg shadow-brand-950/25" : "text-brand-100 hover:bg-white/10 hover:text-white"}`}>
            <Boxes className="h-5 w-5" /> Productos
          </Link>
          <div className="my-5 border-t border-white/10" />
          <Link href="/" onClick={close} className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-brand-100 transition hover:bg-white/10 hover:text-white"><Home className="h-5 w-5" /> Ver catálogo público</Link>
        </nav>

        <div className="border-t border-white/10 bg-brand-950/30 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ${isAdmin ? "bg-jade-500 ring-jade-300" : "bg-brand-600 ring-brand-300"}`}>{user?.username?.slice(0, 2).toUpperCase() || "US"}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{user?.fullName || user?.username}</p><p className="truncate text-[11px] text-brand-200">@{user?.username}</p></div>
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${isAdmin ? "border-jade-300/30 bg-jade-400/15 text-jade-100" : "border-brand-300/30 bg-brand-400/15 text-brand-100"}`}>{isAdmin ? "Admin" : "User"}</span>
          </div>
          <div className={`mb-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-semibold ${isInactivityWarning ? "border-amber-300/40 bg-amber-400/15 text-amber-100" : "border-brand-300/20 bg-white/5 text-brand-100"}`}>
            {isInactivityWarning ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}<span>{isInactivityWarning ? "Sesión por expirar" : "Sesión activa"} · {formatSessionTime(remainingSeconds)}</span>
          </div>
          <button onClick={() => void logout()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-300/20 bg-rose-400/10 px-3 py-2.5 text-xs font-semibold text-rose-100 transition hover:border-transparent hover:bg-rose-500 hover:text-white"><LogOut className="h-3.5 w-3.5" /> Cerrar sesión</button>
        </div>
      </aside>
    </>
  );
};
