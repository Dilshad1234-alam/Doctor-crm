import { Building2, Stethoscope, Users, UserCircle, Calculator } from "lucide-react";

export default function RoleSection() {
  const roles = [
    { title: "Clinic Owner", icon: <Building2 size={24} />, desc: "Complete clinic control and reporting" },
    { title: "Doctor", icon: <Stethoscope size={24} />, desc: "Queue, consultation, prescription and patient history" },
    { title: "Receptionist", icon: <Users size={24} />, desc: "Patient registration, appointment, check-in and billing" },
    { title: "Assistant", icon: <UserCircle size={24} />, desc: "Vitals and medical report preparation" },
    { title: "Accountant", icon: <Calculator size={24} />, desc: "Invoice, payment and financial reporting" },
  ];

  return (
    <section className="py-24 bg-blue-50 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built for Every Member of Your Clinic</h2>
          <p className="text-lg text-gray-600">
            A single platform that adapts to whoever is logging in, ensuring everyone has exactly the tools they need.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {roles.map((role, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] text-center">
              <div className="w-14 h-14 mx-auto bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                {role.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{role.title}</h3>
              <p className="text-gray-500">{role.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
