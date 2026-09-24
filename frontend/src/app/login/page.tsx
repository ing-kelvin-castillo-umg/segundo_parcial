"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  KeyRound,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ChevronLeft,
} from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(username, password);
      router.push("/dashboard/products");
    } catch (err: any) {
      setError(err.message || "Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-surface-darker text-slate-100 relative overflow-hidden font-sans selection:bg-primary-500/30 selection:text-primary-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-secondary-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-surface-card/60 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-600 text-white flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(217,70,239,0.3)]">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Iniciar Sesión</h2>
          <p className="text-xs text-slate-400">
            Ingresa con tu cuenta para acceder a la gestión de productos
          </p>
        </div>

        {/* Quick Fill Credentials Buttons (Ideal for evaluation!) */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Acceso Rápido para Pruebas:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials("admin", "admin123")}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rol Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("user", "user123")}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Rol Usuario</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Usuario
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin o user"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 border border-primary-400/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Entrar al Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
