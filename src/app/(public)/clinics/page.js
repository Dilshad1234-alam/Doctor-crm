import Link from "next/link";
import { Building2, Users, UserPlus, Calendar, List, Stethoscope, Pill, FileText, CreditCard, Shield, BarChart, Settings, Activity, TrendingUp } from "lucide-react";

export const metadata = {
  title: "For Clinics | Doctor CRM",
  description: "Everything Your Clinic Needs in One Platform",
};

export default function ClinicsPage() {
  const modules = [
    { title: "Clinic Management", icon: <Building2 size={24} />, desc: "Centralized control for owners." },
    { title: "Doctor Management", icon: <Users size={24} />, desc: "Manage schedules and access." },
    { title: "Staff Management", icon: <UserPlus size={24} />, desc: "Role-based permissions." },
    { title: "Patient Management", icon: <Users size={24} />, desc: "Secure electronic health records." },
    { title: "Appointment Scheduling", icon: <Calendar size={24} />, desc: "Smart booking and reminders." },
    { title: "Queue", icon: <List size={24} />, desc: "Live waiting room tracking." },
    { title: "Consultation", icon: <Stethoscope size={24} />, desc: "Digital clinical workspace." },
    { title: "Prescription", icon: <Pill size={24} />, desc: "Fast, readable e-prescriptions." },
    { title: "Billing", icon: <CreditCard size={24} />, desc: "Integrated invoicing system." },
    { title: "Payments", icon: <Shield size={24} />, desc: "Track cash, card, and UPI." },
    { title: "Reports", icon: <BarChart size={24} />, desc: "Detailed revenue analytics." },
    { title: "Settings", icon: <Settings size={24} />, desc: "Customize to your clinic's workflow." },
  ];

  return (
    <div className="font-sans min-h-screen bg-gray-50 pb-24 overflow-x-hidden">
      {/* Hero Section matching Home Page (without image) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#15558d] to-[#2ab5e1] pb-32 pt-16 sm:pt-24 lg:pt-32 min-h-[500px] font-sans">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            
            {/* Left Text Content */}
            <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-6 shadow-sm">
                <Building2 size={16} />
                <span>Enterprise Grade Management</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
                Everything Your Clinic <br className="hidden lg:block" /> Needs in One Platform
              </h1>
              
              <p className="text-lg sm:text-xl text-blue-50 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                Scale your clinic operations securely with role-based access, comprehensive reporting, and digital workflows.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto bg-white text-blue-600 font-bold py-3 px-8 rounded-xl transition-colors shadow-xl text-center"
                >
                  Register Your Clinic
                </Link>
                <Link 
                  href="#modules" 
                  className="w-full sm:w-auto bg-blue-700/50 hover:bg-blue-700/70 text-white border border-blue-400 font-bold py-3 px-8 rounded-xl transition-colors text-center"
                >
                  View All Features
                </Link>
              </div>
            </div>
            
            {/* Right Visual Content (No Image, just floating dashboard widgets) */}
            <div className="lg:col-span-6 relative h-72 lg:h-96">
              
              <div className="absolute top-0 right-0 sm:right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex gap-4 items-center animate-bounce-slow max-w-sm" style={{ animationDuration: '5s' }}>
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Daily Revenue</p>
                  <p className="text-2xl font-black text-gray-900">₹45,200</p>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                    <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-0 sm:left-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex gap-4 items-center animate-bounce-slow" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Users size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Staff Active</p>
                  <p className="text-xl font-black text-gray-900">12 / 15 Online</p>
                </div>
              </div>

              <div className="absolute bottom-0 right-10 sm:right-24 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex gap-4 items-center animate-bounce-slow" style={{ animationDuration: '6s', animationDelay: '0.5s' }}>
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Activity size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Appointments</p>
                  <p className="text-xl font-black text-gray-900">142 Today</p>
                </div>
              </div>

            </div>
            
          </div>
        </div>
        
        {/* Background abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
        </div>
      </section>

      {/* Modules Grid */}
      <section id="modules" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Operational Control</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">From the front desk to the doctor's office, every module is designed to work together seamlessly.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modules.map((m, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 border border-gray-100 transition-colors group">
                <div className="w-14 h-14 bg-white text-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  {m.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{m.title}</h3>
                <p className="text-sm text-gray-600">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24 text-center px-4 max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Take control of your clinic today.</h2>
        <p className="text-lg text-gray-600 mb-8">Set up your clinic, invite your doctors and staff, and start accepting patients in minutes.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl transition-colors shadow-xl shadow-blue-500/20">
          Register Your Clinic
        </Link>
      </section>
    </div>
  );
}
