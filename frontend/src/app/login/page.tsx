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
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "inactivity") {
      setSessionMessage("Tu sesión se cerró por inactividad.");
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
      setSessionMessage(null);
      await login(username, password);
      router.push("/dashboard/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Usuario o contraseña incorrectos.");
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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-dark-background text-dark-text relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-primary-medium/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-1.5 rounded text-xs font-semibold text-dark-muted/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-dark-surface/70 backdrop-blur-xl border border-primary-medium/25 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-lift">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Iniciar Sesión</h2>
          <p className="text-xs text-dark-muted/70">
            Ingresa con tu cuenta para acceder a la gestión de productos
          </p>
        </div>

        {/* Quick Fill Credentials Buttons (Ideal for evaluation!) */}
        <div className="p-3.5 rounded-2xl bg-dark-background/55 border border-primary-medium/20 space-y-2">
          <span className="text-[11px] font-bold text-dark-muted/65 uppercase tracking-wider block">
            Acceso Rápido para Pruebas:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials("admin", "admin123")}
              className="focus-ring flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary-medium/15 hover:bg-primary-medium/25 text-dark-muted border border-primary-medium/30 text-xs font-semibold transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rol Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("user", "user123")}
              className="focus-ring flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-success/15 hover:bg-success/25 text-green-200 border border-success/30 text-xs font-semibold transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Rol Usuario</span>
            </button>
          </div>
        </div>

        {sessionMessage && (
          <div className="p-3 bg-secondary/10 border border-secondary/35 rounded-xl text-xs text-secondary-light flex items-center gap-2" role="status">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{sessionMessage}</span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-danger/15 border border-danger/35 rounded-xl text-xs text-red-200 flex items-center gap-2" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-dark-muted uppercase mb-1.5">
              Usuario
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-dark-muted/65 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin o user"
                className="focus-ring w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-medium/25 bg-dark-background/60 text-white placeholder:text-dark-muted/40 text-sm hover:border-primary-medium/45 focus:border-primary-medium"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-dark-muted uppercase mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-dark-muted/65 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="focus-ring w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-medium/25 bg-dark-background/60 text-white placeholder:text-dark-muted/40 text-sm hover:border-primary-medium/45 focus:border-primary-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
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
