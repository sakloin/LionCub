"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { CartProvider } from "../context/CartContext";
import { LanguageProvider } from "../context/LanguageContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CartProvider>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-jetbrains, monospace)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              background: "var(--color-ink)",
              color: "var(--color-bg)",
              border: "none",
              borderRadius: "4px",
              padding: "12px 18px",
            },
          }}
        />
      </CartProvider>
    </LanguageProvider>
  );
}
