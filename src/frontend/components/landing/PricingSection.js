import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for single practitioners",
      features: ["1 Doctor", "2 Staff Members", "Unlimited Patients", "Appointments & Queue", "Basic Prescriptions"],
    },
    {
      name: "Professional",
      description: "Ideal for growing clinics",
      isPopular: true,
      features: ["Up to 5 Doctors", "10 Staff Members", "Unlimited Patients", "Advanced Billing", "Medical Reports", "Basic Analytics"],
    },
    {
      name: "Clinic Pro",
      description: "For large multi-specialty clinics",
      features: ["Unlimited Doctors", "Unlimited Staff", "Custom Roles", "Priority Support", "Advanced Analytics", "Data Export"],
    }
  ];

  return (
    <section className="py-24 bg-white font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600">
            Choose the perfect plan for your clinic's needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative bg-white rounded-2xl border ${plan.isPopular ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-gray-200 shadow-sm'} p-8 flex flex-col`}>
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-4xl font-black text-gray-900">Contact Us</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-3">
                    <Check size={20} className="text-teal-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/register" 
                className={`w-full text-center py-3 rounded-xl font-bold transition-colors ${plan.isPopular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
