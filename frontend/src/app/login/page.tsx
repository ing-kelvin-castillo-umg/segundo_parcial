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
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  // Se lee en el cliente (sin useSearchParams) para no requerir un Suspense boundary en la página estática.
  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "inactividad") {
      setNotice("Sesión cerrada por inactividad");
    } else if (reason === "expired") {
      setNotice("Tu sesión expiró, inicia sesión nuevamente");
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

  const NoticeIcon = notice === "Sesión cerrada por inactividad" ? Clock : AlertTriangle;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-900 relative overflow-hidden">
      {/* Decoración */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Volver */}
      <div className="relative w-full max-w-md mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-lg text-xs font-semibold text-secondary-100 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Volver al Inicio</span>
        </Link>
      </div>

      {/* Tarjeta */}
      <main className="relative w-full max-w-md bg-surface text-foreground rounded-3xl p-6 sm:p-8 shadow-2xl shadow-secondary-950/40 space-y-6 animate-scale-in">
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-primary-700/30">
            <Package className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Iniciar Sesión</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa con tu cuenta para acceder a la gestión de productos
          </p>
        </div>

        {/* Aviso de sesión cerrada (inactividad / expiración) */}
        {notice && !error && (
          <div
            role="status"
            className="p-3.5 rounded-xl border border-warning-200 bg-warning-50 text-sm font-semibold text-warning-800 flex items-center gap-2.5 animate-slide-down"
          >
            <NoticeIcon className="w-5 h-5 shrink-0 text-warning-700" aria-hidden="true" />
            <span>{notice}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl border border-danger-200 bg-danger-50 text-sm text-danger-800 flex items-center gap-2.5 animate-slide-down"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-danger-700" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Acceso rápido */}
        <div className="p-3.5 rounded-2xl bg-muted border border-border space-y-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Acceso rápido para pruebas
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials("admin", "admin123")}
              className="btn btn-sm py-2 bg-accent-100 text-accent-800 border border-accent-200 hover:bg-accent-200"
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Rol Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("user", "user123")}
              className="btn btn-sm py-2 bg-primary-50 text-primary-800 border border-primary-200 hover:bg-primary-100"
            >
              <UserIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Rol Usuario</span>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="label">
              Usuario
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin o user"
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="label">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Entrar al Sistema</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </main>

      <p className="relative mt-6 text-xs text-secondary-200">
        Universidad Mariano Gálvez de Guatemala · Segundo Parcial
      </p>
    </div>
  );
}
