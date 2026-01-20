import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Rankings from "@/components/landing/Rankings";
import Rewards from "@/components/landing/Rewards";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Rankings />
        <Rewards />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
