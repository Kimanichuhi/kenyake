import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DestinationsSection from "@/components/DestinationsSection";
import ExperiencesSection from "@/components/ExperiencesSection";
import WildlifeSection from "@/components/WildlifeSection";
import CommunitySection from "@/components/CommunitySection";
import FooterSection from "@/components/FooterSection";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <DestinationsSection />
    <ExperiencesSection />
    <WildlifeSection />
    <CommunitySection />
    <FooterSection />
  </div>
);

export default Index;
