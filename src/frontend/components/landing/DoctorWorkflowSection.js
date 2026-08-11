import { ArrowRight, LayoutList, UserCheck, Activity, Stethoscope, FileSignature, RefreshCcw } from "lucide-react";

export default function DoctorWorkflowSection() {
  const steps = [
    { icon: <LayoutList size={24} />, label: "Queue" },
    { icon: <UserCheck size={24} />, label: "Patient" },
    { icon: <Activity size={24} />, label: "Vitals" },
    { icon: <Stethoscope size={24} />, label: "Consultation" },
    { icon: <FileSignature size={24} />, label: "Prescription" },
    { icon: <RefreshCcw size={24} />, label: "Follow-up" },
  ];

  return (
    <section className="py-24 bg-gray-900 text-white font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">A Faster Doctor Workflow</h2>
          <p className="text-lg text-gray-400">
            Spend less time on paperwork and software navigation, and more time treating patients.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
          {/* Connector Line Desktop */}
          <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-gray-700 -translate-y-1/2 z-0"></div>
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center relative z-10 w-full md:w-auto">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 border-2 border-gray-700 text-blue-400 flex items-center justify-center shadow-xl mb-4 group hover:border-blue-500 hover:bg-gray-700 transition-colors cursor-default">
                {step.icon}
              </div>
              <span className="font-bold text-sm text-gray-300">{step.label}</span>
              
              {/* Mobile Connector */}
              {idx < steps.length - 1 && (
                <div className="md:hidden w-0.5 h-8 bg-gray-700 my-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
