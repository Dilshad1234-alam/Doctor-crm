import Container from "@/frontend/components/ui/Container";
import SectionHeading from "@/frontend/components/ui/SectionHeading";
import Button from "@/frontend/components/ui/Button";
import { pricingPlans } from "@/frontend/constants/landingPage";

export default function PricingPreviewSection() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <Container>
        <SectionHeading
          eyebrow="Pricing Preview"
          title="Simple Plans for Every Clinic"
          description="Affordable pricing designed for practices of all sizes."
        />
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto items-center">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.name} 
              className={`group bg-white rounded-3xl p-8 transition-all duration-300 ${
                plan.isPopular 
                  ? "ring-2 ring-teal-500 shadow-2xl shadow-teal-500/20 lg:scale-105 z-10 relative" 
                  : "ring-1 ring-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 -translate-y-1/2 inset-x-0 flex justify-center">
                  <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg shadow-teal-500/30">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-gray-900">
                {plan.price}
              </div>
              <ul className="mt-8 space-y-4 text-sm text-gray-600">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-teal-500 font-bold">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button 
                  href="/register" 
                  variant={plan.isPopular ? "primary" : "outline"} 
                  className="w-full justify-center"
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">
          * These prices are placeholders for product preview. Final pricing can change.
        </p>
      </Container>
    </section>
  );
}
