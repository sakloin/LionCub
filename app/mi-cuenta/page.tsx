"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function MiCuentaPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function init() {
      await new Promise((r) => setTimeout(r, 300));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        router.replace("/login");
        return;
      }
      setEmail(session.user.email);
      setLoading(false);
    }
    init();
  }, [router]);

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <p className="text-[#9B8D7E] text-sm">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="max-w-sm mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-bold text-[#1A1410] text-lg">Mi cuenta</p>
          <p className="text-[#9B8D7E] text-sm mt-1">{email}</p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          <Link
            href="/mi-cuenta/pedidos"
            className="flex items-center justify-between bg-white border border-[#E8DFCB] rounded-2xl px-5 py-4 hover:border-[#C9A961] transition-colors"
          >
            <div>
              <p className="font-semibold text-[#1A1410] text-sm">Mis pedidos</p>
              <p className="text-[#9B8D7E] text-xs mt-0.5">Revisa el estado de tus compras</p>
            </div>
            <span className="text-[#C9A961] text-lg">→</span>
          </Link>

          <Link
            href="/"
            className="flex items-center justify-between bg-white border border-[#E8DFCB] rounded-2xl px-5 py-4 hover:border-[#C9A961] transition-colors"
          >
            <div>
              <p className="font-semibold text-[#1A1410] text-sm">Ir a la tienda</p>
              <p className="text-[#9B8D7E] text-xs mt-0.5">Explora la colección</p>
            </div>
            <span className="text-[#C9A961] text-lg">→</span>
          </Link>
        </div>

        {/* Support */}
        <div className="mt-6 bg-white border border-[#E8DFCB] rounded-2xl px-5 py-4 text-center">
          <p className="text-[#5B4F42] text-sm mb-2">¿Necesitas ayuda?</p>
          <a
            href="https://wa.me/51920201943"
            className="text-[#25D366] font-semibold text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Escríbenos por WhatsApp
          </a>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          disabled={signingOut}
          className="w-full mt-6 text-[#9B8D7E] text-sm hover:text-[#5B4F42] transition-colors disabled:opacity-50"
        >
          {signingOut ? "Cerrando sesión…" : "Cerrar sesión"}
        </button>
      </div>
    </div>
  );
}
