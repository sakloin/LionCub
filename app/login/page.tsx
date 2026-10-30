"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: pw,
          options: { data: { full_name: name.trim() } },
        });
        if (signUpError) {
          setError(signUpError.message === "User already registered"
            ? "Ya existe una cuenta con ese correo. Inicia sesión."
            : "No se pudo crear la cuenta. Intenta de nuevo.");
          return;
        }
        setInfo("Te enviamos un correo de confirmación. Revisa tu bandeja y haz clic en el enlace para activar tu cuenta.");
        return;
      }

      // Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pw,
      });
      if (signInError) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      // Let the server decide: /api/admin/session verifies the JWT and the
      // admin email list server-side, never the client.
      const token = data.session?.access_token;
      if (token) {
        const res = await fetch("/api/admin/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (res.ok) {
          router.push("/admin");
          return;
        }
      }
      router.push("/mi-cuenta");
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo-solid.png"
            alt="Lion Cub Baby Clothing"
            width={56}
            height={56}
            className="rounded-2xl mb-3"
            priority
          />
          <p className="lc-display font-bold text-[#1A1410] text-lg tracking-tight">Lion Cub</p>
          <p className="text-[#756A5E] text-sm mt-0.5">
            {mode === "signin" ? "Bienvenida de nuevo" : "Crea tu cuenta"}
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-[#E8DFCB] shadow-sm p-7 flex flex-col gap-4"
        >
          {/* Name — only for sign-up */}
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-name" className="text-sm font-semibold text-[#1A1410]">
                Nombre
              </label>
              <input
                id="login-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                placeholder="Tu nombre"
                className="min-h-11 border border-[#E8DFCB] rounded-xl px-4 text-[#1A1410] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
                autoFocus
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-sm font-semibold text-[#1A1410]">
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              placeholder="hola@ejemplo.com"
              className="min-h-11 border border-[#E8DFCB] rounded-xl px-4 text-[#1A1410] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
              autoFocus={mode === "signin"}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-pw" className="text-sm font-semibold text-[#1A1410]">
              Contraseña
            </label>
            <input
              id="login-pw"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="min-h-11 border border-[#E8DFCB] rounded-xl px-4 text-[#1A1410] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
            />
          </div>

          {error && (
            <p role="alert" className="text-red-700 text-sm text-center bg-red-50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {info && (
            <p role="status" className="text-[#5B4F42] text-sm text-center bg-[#EFE0BB] rounded-xl px-3 py-2">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 bg-[#1A1410] text-white font-semibold rounded-2xl mt-1 hover:bg-[#2a2018] transition-colors disabled:opacity-50"
          >
            {loading
              ? "Cargando…"
              : mode === "signin"
              ? "Ingresar"
              : "Crear cuenta"}
          </button>

          <p className="text-center text-sm text-[#756A5E]">
            {mode === "signin" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
                  className="text-[#86652C] font-semibold underline py-2 -my-2 px-1"
                >
                  Crear cuenta
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setError(""); setInfo(""); }}
                  className="text-[#86652C] font-semibold underline py-2 -my-2 px-1"
                >
                  Iniciar sesión
                </button>
              </>
            )}
          </p>
        </form>

        {/* Back to store */}
        <p className="text-center mt-6">
          <Link href="/" className="text-[#756A5E] text-sm hover:text-[#5B4F42]">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
}
