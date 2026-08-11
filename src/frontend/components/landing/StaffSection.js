import { Network, ArrowDown } from "lucide-react";

export default function StaffSection() {
  return (
    <section className="py-24 bg-blue-600 text-white font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Whole Clinic Team, One Platform</h2>
          <p className="text-lg text-blue-100">
            Every role receives controlled access based on granular permissions, ensuring data privacy and operational efficiency.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-8 py-4 mb-4 font-bold text-lg">
            Single Login
          </div>
          <ArrowDown className="text-blue-300 mb-4" />
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-8 py-4 mb-4 font-bold text-lg">
            Role Detection
          </div>
          <ArrowDown className="text-blue-300 mb-4" />
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="bg-blue-800 border border-blue-500 rounded-xl px-6 py-3 font-medium text-center">Clinic Owner</div>
            <div className="bg-blue-800 border border-blue-500 rounded-xl px-6 py-3 font-medium text-center">Doctor</div>
            <div className="bg-blue-800 border border-blue-500 rounded-xl px-6 py-3 font-medium text-center">Receptionist</div>
            <div className="bg-blue-800 border border-blue-500 rounded-xl px-6 py-3 font-medium text-center">Assistant</div>
            <div className="bg-blue-800 border border-blue-500 rounded-xl px-6 py-3 font-medium text-center">Accountant</div>
          </div>
          
          <ArrowDown className="text-blue-300 mb-4" />
          <div className="bg-white text-blue-600 font-bold rounded-xl px-8 py-4 shadow-xl flex items-center gap-3">
            <Network size={24} />
            Secure API Permissions & Role-Based Dashboard
          </div>
        </div>
      </div>
    </section>
  );
}
