import { LanguageProvider } from "./context/LanguageContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import Collection from "./components/Collection";
import WhyPima from "./components/WhyPima";
import OurStory from "./components/OurStory";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <LanguageProvider>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Collection />
        <WhyPima />
        <OurStory />
        <Testimonials />
      </main>
      <Footer />
    </LanguageProvider>
  );
}
