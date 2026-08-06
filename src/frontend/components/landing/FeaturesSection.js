import Container from "@/frontend/components/ui/Container";
import SectionHeading from "@/frontend/components/ui/SectionHeading";
import FeatureCard from "@/frontend/components/ui/FeatureCard";
import { features } from "@/frontend/constants/landingPage";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Everything Your Clinic Needs"
          description="A complete suite of tools designed specifically to streamline your medical practice."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
