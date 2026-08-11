import { LayoutDashboard, Users, Calendar, Activity, FileText, Pill, CreditCard, BarChart, Shield, UserPlus, FileHeart, Stethoscope } from "lucide-react";

export default function PlatformOverview() {
  const features = [
    { name: "Doctors", icon: <Stethoscope size={20} /> },
    { name: "Staff", icon: <UserPlus size={20} /> },
    { name: "Patients", icon: <Users size={20} /> },
    { name: "Appointments", icon: <Calendar size={20} /> },
    { name: "Queue", icon: <LayoutDashboard size={20} /> },
    { name: "Vitals", icon: <Activity size={20} /> },
    { name: "Consultations", icon: <FileHeart size={20} /> },
    { name: "Prescriptions", icon: <Pill size={20} /> },
    { name: "Medical Reports", icon: <FileText size={20} /> },
    { name: "Billing", icon: <CreditCard size={20} /> },
    { name: "Payments", icon: <Shield size={20} /> },
    { name: "Analytics", icon: <BarChart size={20} /> },
  ];

  return (
    <section id="platform-overview" className="py-20 bg-gray-50 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything Your Clinic Needs</h2>
          <p className="text-lg text-gray-600">
            Doctor CRM brings your complete clinic workflow into one secure, easy-to-use platform.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                {feature.icon}
              </div>
              <span className="font-semibold text-gray-800">{feature.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
