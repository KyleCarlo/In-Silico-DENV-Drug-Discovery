import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { SocialProof } from "@/components/SocialProof";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Problem />
      <SocialProof />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
