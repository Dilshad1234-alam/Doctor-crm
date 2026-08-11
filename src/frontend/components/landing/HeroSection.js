import Link from "next/link";
import { MessageSquare, Users, Star, Video, Phone, Mic, ShieldCheck } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#15558d] to-[#2ab5e1] pb-24 pt-16 sm:pt-24 lg:pt-32 min-h-[600px] font-sans">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-6 shadow-sm">
              <ShieldCheck size={16} />
              <span>Built for Modern Clinics</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
              Run Your Clinic Smarter, <br className="hidden lg:block" /> All From One Place
            </h1>
            
            <p className="text-lg sm:text-xl text-blue-50 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
              Manage doctors, staff, patients, appointments, consultations, prescriptions, billing and reports with one powerful clinic management platform.
            </p>
            
            {/* CTA Bar */}
            <div className="bg-white p-3 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center px-4 py-2 w-full">
                <span className="text-gray-500 font-medium">Manage your clinic from one dashboard</span>
              </div>
              <Link 
                href="#platform-overview" 
                className="w-full sm:w-auto flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors text-center shadow-md shadow-blue-500/20"
              >
                Explore Features
              </Link>
            </div>
          </div>
          
          {/* Right Visual Content */}
          <div className="lg:col-span-6 relative">
            {/* Main Visual Frame */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              
              {/* Doctor Placeholder (Image) */}
              <div className="relative rounded-[2rem] bg-blue-900/20 backdrop-blur-sm border border-white/20 aspect-[4/5] md:aspect-[1/1] lg:aspect-[4/5] overflow-hidden shadow-2xl flex items-end justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop" 
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
              
              {/* Floating Badge 1 - Appointments */}
              <div className="absolute top-10 -left-6 sm:-left-12 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 flex gap-4 items-center">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 font-bold text-xs">JD</div>
                  <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-green-600 font-bold text-xs">AS</div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-purple-600 font-bold text-xs">MW</div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">5K+ Appointments</p>
                  <div className="flex text-yellow-400 gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                </div>
              </div>
              
              {/* Floating Badge 2 - Chat Icon */}
              <div className="absolute top-1/3 -right-4 sm:-right-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center text-blue-500">
                <MessageSquare size={28} className="text-blue-500" />
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white"></div>
              </div>
              
              {/* Floating Badge 3 - Patients Waiting */}
              <div className="absolute bottom-1/4 -left-6 sm:-left-12 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Patients Waiting</p>
                  <p className="text-lg font-bold text-gray-900">12 Today</p>
                </div>
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
  );
}
