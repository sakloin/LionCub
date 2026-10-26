import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import HeroV2 from "./components/HeroV2";
import CarouselV2 from "./components/CarouselV2";
import ShopByAge from "./components/ShopByAge";
import BestsellerGrid from "./components/BestsellerGrid";
import DiscountBannerV2 from "./components/DiscountBannerV2";
import WhyLionCubV2 from "./components/WhyLionCubV2";
import TestimonialsClothesline from "./components/TestimonialsClothesline";
import Footer from "./components/Footer";

export const revalidate = 60;

export default async function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        <HeroV2 />
        <CarouselV2 />
        <ShopByAge />
        <BestsellerGrid />
        <DiscountBannerV2 />
        <WhyLionCubV2 />
        <TestimonialsClothesline />
      </main>
      <Footer />
    </>
  );
}
