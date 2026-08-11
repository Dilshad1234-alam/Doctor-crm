import { Clock, History, FileText, CheckCircle } from "lucide-react";

export default function PatientExperienceSection() {
  const benefits = [
    { icon: <Clock size={24} />, title: "Less Waiting", desc: "Faster appointment handling and check-ins." },
    { icon: <History size={24} />, title: "Organized History", desc: "All past visits and medical history in one place." },
    { icon: <FileText size={24} />, title: "Digital Prescriptions", desc: "Clear, printed or emailed prescriptions." },
    { icon: <CheckCircle size={24} />, title: "Simple Billing", desc: "Transparent invoices and payment tracking." },
  ];

  return (
    <section className="py-24 bg-white font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Better Care Starts With Better Clinic Management</h2>
          <p className="text-lg text-gray-600">
            When your clinic runs smoothly, your patients notice. Improve patient satisfaction with a modern experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100 hover:bg-blue-50 transition-colors">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                {benefit.icon}
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
