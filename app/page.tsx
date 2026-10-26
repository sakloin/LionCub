import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import HeroVitrina from "./components/HeroVitrina";
import TrustBar from "./components/TrustBar";
import Collection from "./components/Collection";
import WhyPima from "./components/WhyPima";
import Footer from "./components/Footer";
import { getCatalog } from "./lib/catalog";

// Revalida el catálogo en el servidor cada 60 s (ISR): rápido y razonablemente
// fresco en stock/precios. El stock real se vuelve a verificar al confirmar el pedido.
export const revalidate = 60;

export default async function Home() {
  const { products, offers } = await getCatalog();
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        <HeroVitrina />
        <Collection initialProducts={products} initialOffers={offers} />
        <TrustBar />
        <WhyPima />
        {/* OurStory y Testimonials ocultos — enfoque en productos al estilo Falabella */}
      </main>
      <Footer />
    </>
  );
}
