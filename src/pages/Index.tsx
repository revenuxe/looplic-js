import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BrandGrid from "@/components/BrandGrid";
import ScreenGuardTypes from "@/components/ScreenGuardTypes";
import HowItWorks from "@/components/HowItWorks";
import TrustSignals from "@/components/TrustSignals";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <BrandGrid />
      <ScreenGuardTypes />
      <HowItWorks />
      <TrustSignals />
      <Footer />
    </div>
  );
};

export default Index;
