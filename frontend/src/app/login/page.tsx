"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  KeyRound,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Loader2,
  ChevronLeft,
} from "lucide-react";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Motivo por el que el usuario fue devuelto a esta pantalla.
  const reason = searchParams.get("reason");
  const sessionNotice =
    reason === "inactivity"
      ? "Sesión cerrada por inactividad"
      : reason === "expired"
      ? "Tu sesión expiró. Vuelve a iniciar sesión para continuar."
      : null;

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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-surface-950 text-surface-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-surface-900/90 backdrop-blur-xl border border-surface-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-primary-500/25">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Iniciar Sesión</h2>
          <p className="text-xs text-surface-400">
            Ingresa con tu cuenta para acceder a la gestión de productos
          </p>
        </div>

        {/* Quick Fill Credentials Buttons (Ideal for evaluation!) */}
        <div className="p-3.5 rounded-2xl bg-surface-800/60 border border-surface-700/60 space-y-2">
          <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block">
            Acceso Rápido para Pruebas:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials("admin", "admin123")}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 border border-accent-500/30 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rol Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("user", "user123")}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-success-500/20 hover:bg-success-500/30 text-success-300 border border-success-500/30 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Rol Usuario</span>
            </button>
          </div>
        </div>

        {/* Aviso de sesión finalizada (inactividad o token vencido) */}
        {sessionNotice && !error && (
          <div className="p-3 bg-accent-500/10 border border-accent-500/30 rounded-xl text-xs text-accent-300 flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{sessionNotice}</span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl text-xs text-danger-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase mb-1.5">
              Usuario
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin o user"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-700 bg-surface-800 text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-700 bg-surface-800 text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm shadow-lg shadow-primary-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
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

/**
 * useSearchParams obliga a renderizar en cliente; el Suspense evita que el
 * prerenderizado estático de Next.js falle durante la compilación.
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface-950 text-surface-400">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
