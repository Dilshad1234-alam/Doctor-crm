import LandingNavbar from "@/frontend/components/landing/LandingNavbar";
import HeroSection from "@/frontend/components/landing/HeroSection";
import TrustedSection from "@/frontend/components/landing/TrustedSection";
import FeaturesSection from "@/frontend/components/landing/FeaturesSection";
import WorkflowSection from "@/frontend/components/landing/WorkflowSection";
import RolesSection from "@/frontend/components/landing/RolesSection";
import BenefitsSection from "@/frontend/components/landing/BenefitsSection";
import MultiDoctorSection from "@/frontend/components/landing/MultiDoctorSection";
import PricingPreviewSection from "@/frontend/components/landing/PricingPreviewSection";
import TestimonialSection from "@/frontend/components/landing/TestimonialSection";
import CTASection from "@/frontend/components/landing/CTASection";
import LandingFooter from "@/frontend/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <TrustedSection />
        <FeaturesSection />
        <WorkflowSection />
        <RolesSection />
        <BenefitsSection />
        <MultiDoctorSection />
        <PricingPreviewSection />
        <TestimonialSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
