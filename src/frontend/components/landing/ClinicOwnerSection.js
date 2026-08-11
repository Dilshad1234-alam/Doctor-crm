import { CheckCircle2, TrendingUp, Users, Calendar } from "lucide-react";
import Link from "next/link";

export default function ClinicOwnerSection() {
  const features = [
    "Multiple Doctors Management",
    "Staff Role & Permission Controls",
    "Global Appointment View",
    "Patient Database Access",
    "Live Queue Monitoring",
    "Billing & Revenue Reports",
    "Clinic-wide Settings"
  ];

  return (
    <section className="py-24 bg-white font-sans overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          
          <div className="mb-12 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Complete Control for Clinic Owners</h2>
            <p className="text-lg text-gray-600 mb-8">
              Oversee your entire clinic's operations from a single dashboard. Track revenue, manage your staff, and ensure your patients are getting the best care.
            </p>
            
            <ul className="space-y-4 mb-8">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-teal-500" size={20} />
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/register" className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg">
              Register Your Clinic
            </Link>
          </div>

          <div className="relative">
            {/* Fake Dashboard UI Card */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-2xl p-6 relative z-10">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Today's Overview</h3>
                  <p className="text-sm text-gray-500">City Health Care</p>
                </div>
                <div className="bg-white px-3 py-1 rounded-full text-sm font-bold text-blue-600 shadow-sm border border-gray-100">
                  Live
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Users size={16} />
                    <span className="text-sm font-medium">Total Patients</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">142</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">Appointments</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">48</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-4">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">Revenue Today</span>
                </div>
                <div className="h-24 w-full flex items-end gap-2">
                  {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-teal-100 rounded-t-sm relative group">
                      <div className="absolute bottom-0 w-full bg-teal-500 rounded-t-sm transition-all duration-500" style={{ height: `${h}%` }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-blue-100 to-teal-50 rounded-full blur-3xl -z-10"></div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
