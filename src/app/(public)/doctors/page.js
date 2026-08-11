import Link from "next/link";
import { LayoutDashboard, Users, Clock, Activity, Stethoscope, FileSignature, FileText, RefreshCcw, ShieldCheck, Video, Phone, Mic, Star, MessageSquare } from "lucide-react";

export const metadata = {
  title: "For Doctors | Doctor CRM",
  description: "Built for Doctors Who Want More Time for Patients",
};

export default function DoctorsPage() {
  const features = [
    { title: "Doctor Dashboard", icon: <LayoutDashboard size={24} />, desc: "See your entire day at a glance." },
    { title: "Patient History", icon: <Users size={24} />, desc: "Access full medical history instantly." },
    { title: "Queue Management", icon: <Clock size={24} />, desc: "Call patients from the live waiting room." },
    { title: "Vitals", icon: <Activity size={24} />, desc: "Pre-recorded vitals ready before you start." },
    { title: "Consultation Workspace", icon: <Stethoscope size={24} />, desc: "Efficient note-taking and diagnosis." },
    { title: "Digital Prescription", icon: <FileSignature size={24} />, desc: "Quick e-prescriptions with drug database." },
    { title: "Medical Reports", icon: <FileText size={24} />, desc: "Upload and review lab results easily." },
    { title: "Follow-up", icon: <RefreshCcw size={24} />, desc: "Automated follow-up scheduling." },
  ];

  return (
    <div className="font-sans min-h-screen bg-gray-50 pb-24 overflow-x-hidden">
      {/* Hero Section matching Home Page */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#15558d] to-[#2ab5e1] pb-32 pt-16 sm:pt-24 lg:pt-32 min-h-[600px] font-sans">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            
            {/* Left Text Content */}
            <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-6 shadow-sm">
                <Stethoscope size={16} />
                <span>For Healthcare Professionals</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
                Built for Doctors Who Want <br className="hidden lg:block" /> More Time for Patients
              </h1>
              
              <p className="text-lg sm:text-xl text-blue-50 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                Leave the paperwork and queue management to the software. Focus on what you do best: providing excellent care.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto bg-white text-blue-600 font-bold py-3 px-8 rounded-xl transition-colors shadow-xl text-center"
                >
                  Register as Doctor
                </Link>
                <Link 
                  href="#features" 
                  className="w-full sm:w-auto bg-blue-700/50 hover:bg-blue-700/70 text-white border border-blue-400 font-bold py-3 px-8 rounded-xl transition-colors text-center"
                >
                  View Features
                </Link>
              </div>
            </div>
            
            {/* Right Visual Content */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                
                {/* Doctor Placeholder (Image) */}
                <div className="relative rounded-[2rem] bg-blue-900/20 backdrop-blur-sm border border-white/20 aspect-[4/5] md:aspect-[1/1] lg:aspect-[4/5] overflow-hidden shadow-2xl flex items-end justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1000&auto=format&fit=crop" 
                    alt="Doctor" 
                    className="w-full h-full object-cover object-top opacity-90"
                  />
                  
                  {/* Floating controls inside doctor image */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-full px-6 py-3 shadow-xl flex gap-4 items-center border border-gray-100">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><Video size={20} /></button>
                    <button className="p-3 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/40 hover:bg-red-600 transition-colors"><Phone size={24} fill="currentColor" /></button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><Mic size={20} /></button>
                  </div>
                </div>
                
                {/* Floating Badge 1 - Patient Reviews */}
                <div className="absolute top-10 -left-6 sm:-left-12 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <Star size={20} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Top Rated Care</p>
                    <p className="text-xs text-gray-500">Based on patient feedback</p>
                  </div>
                </div>
                
                {/* Floating Badge 2 - Chat Icon */}
                <div className="absolute top-1/3 -right-4 sm:-right-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center text-blue-500">
                  <MessageSquare size={28} className="text-blue-500" />
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-teal-500 rounded-full border-2 border-white"></div>
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

      {/* Features Grid */}
      <section id="features" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">A Workspace Designed for You</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Everything you need to consult, diagnose, and treat patients is one click away.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 border border-gray-100 transition-colors group">
                <div className="w-14 h-14 bg-white text-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-24 text-center px-4 max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to upgrade your practice?</h2>
        <p className="text-lg text-gray-600 mb-8">Join thousands of doctors who have reclaimed their time and improved patient outcomes.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl transition-colors shadow-xl shadow-blue-500/20">
          Get Started Now
        </Link>
      </section>
    </div>
  );
}
