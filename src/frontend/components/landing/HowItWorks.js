import { Building2, UserPlus, Users, CalendarCheck, Stethoscope, FileCheck } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    { title: "Create Your Clinic", icon: <Building2 size={24} />, description: "Sign up and set up your clinic profile in seconds." },
    { title: "Add Doctors & Staff", icon: <UserPlus size={24} />, description: "Invite your team and assign role-based permissions." },
    { title: "Register Patients", icon: <Users size={24} />, description: "Add patient profiles or let them check in." },
    { title: "Book Appointments", icon: <CalendarCheck size={24} />, description: "Schedule visits and manage the live queue." },
    { title: "Manage Consultations", icon: <Stethoscope size={24} />, description: "Record vitals and perform digital consultations." },
    { title: "Prescription & Billing", icon: <FileCheck size={24} />, description: "Generate e-prescriptions and accurate invoices." },
  ];

  return (
    <section className="py-24 bg-white font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600">
            A seamless workflow from the moment a patient walks in to the moment they leave.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 relative z-10">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 relative">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-blue-600 font-bold text-xs flex items-center justify-center border border-gray-100 shadow-sm">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
