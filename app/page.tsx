import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import Collection from "./components/Collection";
import WhyPima from "./components/WhyPima";
import OurStory from "./components/OurStory";
import Testimonials from "./components/Testimonials";
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
        <Hero />
        <TrustBar />
        <Collection initialProducts={products} initialOffers={offers} />
        <WhyPima />
        <OurStory />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
