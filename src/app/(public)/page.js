import HeroSection from "@/frontend/components/landing/HeroSection";
import QuickFeatures from "@/frontend/components/landing/QuickFeatures";
import PlatformOverview from "@/frontend/components/landing/PlatformOverview";
import HowItWorks from "@/frontend/components/landing/HowItWorks";
import RoleSection from "@/frontend/components/landing/RoleSection";
import ClinicOwnerSection from "@/frontend/components/landing/ClinicOwnerSection";
import DoctorWorkflowSection from "@/frontend/components/landing/DoctorWorkflowSection";
import PatientExperienceSection from "@/frontend/components/landing/PatientExperienceSection";
import SecuritySection from "@/frontend/components/landing/SecuritySection";
import AnalyticsPreview from "@/frontend/components/landing/AnalyticsPreview";
import StaffSection from "@/frontend/components/landing/StaffSection";
import ClinicWorkflow from "@/frontend/components/landing/ClinicWorkflow";
import PricingSection from "@/frontend/components/landing/PricingSection";
import FinalCTA from "@/frontend/components/landing/FinalCTA";

export const metadata = {
  title: "Doctor CRM | Clinic and Patient Management",
  description: "Manage doctors, patients, appointments, prescriptions, billing and follow-ups from one secure clinic management platform.",
};

export default function LandingPage() {
  return (
    <div className="font-sans w-full overflow-x-hidden">
      <HeroSection />
      <QuickFeatures />
      <PlatformOverview />
      <HowItWorks />
      <RoleSection />
      <ClinicOwnerSection />
      <DoctorWorkflowSection />
      <PatientExperienceSection />
      <SecuritySection />
      <AnalyticsPreview />
      <StaffSection />
      <ClinicWorkflow />
      <PricingSection />
      <FinalCTA />
    </div>
  );
}
