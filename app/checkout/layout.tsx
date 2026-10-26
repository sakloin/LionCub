import type { Metadata } from "next";

// La página del checkout es un componente cliente: su metadata vive aquí.
// noindex: no aporta a la búsqueda (robots.txt también la excluye).
export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
