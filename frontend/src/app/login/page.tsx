"use client";

import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "idle") {
      setError("Sesión cerrada por inactividad");
    } else if (reason === "expired") {
      setError("La sesión expiró. Inicia sesión nuevamente.");
    }
  }, []);

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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-forest-950 text-forest-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-mint-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-gold-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-200 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-forest-900/90 backdrop-blur-xl border border-forest-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-mint-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-mint-500/25">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Iniciar Sesión</h2>
          <p className="text-xs text-forest-200">
            Ingresa con tu cuenta para acceder a la gestión de productos
          </p>
        </div>

        {/* Quick Fill Credentials Buttons (Ideal for evaluation!) */}
        <div className="p-3.5 rounded-2xl bg-forest-800/60 border border-forest-700/60 space-y-2">
          <span className="text-[11px] font-bold text-forest-200 uppercase tracking-wider block">
            Acceso Rápido para Pruebas:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials("admin", "admin123")}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-200 border border-gold-500/30 text-xs font-semibold transition-all hover:scale-[1.02]"
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
            <label className="block text-xs font-semibold text-forest-100 uppercase mb-1.5">
              Usuario
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-forest-200 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin o user"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-forest-700 bg-forest-800 text-white placeholder-forest-300 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest-100 uppercase mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-forest-200 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-forest-700 bg-forest-800 text-white placeholder-forest-300 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-mint-500 hover:bg-mint-400 text-white font-semibold text-sm shadow-lg shadow-mint-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
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
