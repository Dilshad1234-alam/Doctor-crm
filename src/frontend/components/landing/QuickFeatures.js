import { Stethoscope, Users, Calendar, Clock, FileText, CreditCard } from "lucide-react";

export default function QuickFeatures() {
  const features = [
    {
      icon: <Stethoscope size={24} />,
      title: "Doctors",
      description: "Manage multiple doctors and their individual schedules easily.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <Users size={24} />,
      title: "Patients",
      description: "Complete patient history and centralized electronic records.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <Calendar size={24} />,
      title: "Appointments",
      description: "Smart booking system with automated reminders.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: <Clock size={24} />,
      title: "Queue",
      description: "Live waiting room tracking to reduce patient wait times.",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: <FileText size={24} />,
      title: "Prescriptions",
      description: "Digital prescriptions generated in seconds.",
      color: "bg-teal-100 text-teal-600",
    },
    {
      icon: <CreditCard size={24} />,
      title: "Billing",
      description: "Integrated invoicing and payment tracking.",
      color: "bg-rose-100 text-rose-600",
    },
  ];

  return (
    <section className="relative z-20 -mt-12 mb-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group cursor-pointer">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-2 group-hover:shadow-lg ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
