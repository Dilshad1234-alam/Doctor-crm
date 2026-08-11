import { ArrowRight } from "lucide-react";

export default function ClinicWorkflow() {
  const workflow = [
    "Clinic Setup",
    "Doctors & Staff",
    "Patient Registration",
    "Appointment",
    "Check-In",
    "Queue",
    "Vitals",
    "Consultation",
    "Prescription",
    "Medical Reports",
    "Billing / Payment",
    "Reports"
  ];

  return (
    <section className="py-24 bg-gray-50 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Complete CRM Workflow</h2>
          <p className="text-lg text-gray-600">
            From setup to daily operations, we've thought of every step.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 max-w-5xl mx-auto">
          {workflow.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 md:gap-4 mb-4">
              <div className="bg-white border border-blue-200 text-blue-700 font-medium px-4 py-2 rounded-lg shadow-sm whitespace-nowrap">
                {step}
              </div>
              {idx < workflow.length - 1 && (
                <ArrowRight size={16} className="text-gray-400 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
