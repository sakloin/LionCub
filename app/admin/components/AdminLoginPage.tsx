"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { btn, cx, focusRing } from "./ui";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isAllowed(email?: string | null) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pw,
      });
      if (signInError) {
        setError("Credenciales inválidas");
        return;
      }
      if (!isAllowed(data.user?.email)) {
        await supabase.auth.signOut();
        setError("Esta cuenta no tiene acceso al panel");
        return;
      }

      // Sincroniza el JWT con el servidor para que el layout pueda verificarlo.
      const token = data.session?.access_token;
      if (token) {
        await fetch("/api/admin/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      }

      // Recarga para que el Server Component del layout re-evalúe la cookie.
      router.refresh();
    } catch {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <form
        onSubmit={login}
        className="bg-bg-card rounded-3xl border border-rule shadow-[var(--lc-shadow-2)] p-8 sm:p-10 w-full max-w-sm flex flex-col gap-5"
        aria-labelledby="login-title"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <Image
            src="/logo-solid.png"
            alt="Lion Cub Baby Clothing"
            width={64}
            height={64}
            className="rounded-xl bg-bg-card"
            priority
          />
          <div>
            <p className="lc-eyebrow lc-eyebrow-ink">Lion Cub · Admin</p>
            <h1 id="login-title" className="lc-display text-3xl text-ink mt-1">
              Panel de administración
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="admin-email" className="text-sm font-semibold text-ink">
            Correo
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            className={cx("min-h-11 border border-rule rounded-xl px-4 text-ink bg-bg-card", focusRing)}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="admin-pw" className="text-sm font-semibold text-ink">
            Contraseña
          </label>
          <input
            id="admin-pw"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
            required
            className={cx("min-h-11 border border-rule rounded-xl px-4 text-ink bg-bg-card", focusRing)}
          />
        </div>

        {error && (
          <p role="alert" className="text-red-700 text-sm text-center">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={cx(btn.primary, "w-full")}>
          {submitting ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
