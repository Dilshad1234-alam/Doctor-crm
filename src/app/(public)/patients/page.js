import Link from "next/link";
import { Calendar, UserCheck, Clock, FileSignature, FileText, CreditCard, HeartPulse, Heart, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "For Patients | Doctor CRM",
  description: "A Better Patient Experience",
};

export default function PatientsPage() {
  const benefits = [
    { title: "Easy Booking", icon: <Calendar size={24} />, desc: "Schedule appointments instantly online." },
    { title: "Faster Check-In", icon: <UserCheck size={24} />, desc: "Breeze through the reception desk." },
    { title: "Reduced Waiting", icon: <Clock size={24} />, desc: "Live queue tracking so you know when to arrive." },
    { title: "Digital Prescription", icon: <FileSignature size={24} />, desc: "Clear, readable e-prescriptions." },
    { title: "Report History", icon: <FileText size={24} />, desc: "All your lab results in one secure place." },
    { title: "Clear Billing", icon: <CreditCard size={24} />, desc: "Transparent invoices and simple payments." },
    { title: "Follow-up", icon: <HeartPulse size={24} />, desc: "Automated reminders for your next visit." },
    { title: "Data Security", icon: <ShieldCheck size={24} />, desc: "Your medical history is completely private." },
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
                <Heart size={16} fill="currentColor" className="text-red-400" />
                <span>Patient-First Approach</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
                A Better Patient <br className="hidden lg:block" /> Experience Starts Here
              </h1>
              
              <p className="text-lg sm:text-xl text-blue-50 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                Your health journey should be seamless. Clinics using Doctor CRM provide faster, clearer, and more organized care.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto bg-white text-blue-600 font-bold py-3 px-8 rounded-xl transition-colors shadow-xl text-center"
                >
                  Find a Clinic
                </Link>
                <Link 
                  href="#benefits" 
                  className="w-full sm:w-auto bg-blue-700/50 hover:bg-blue-700/70 text-white border border-blue-400 font-bold py-3 px-8 rounded-xl transition-colors text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>
            
            {/* Right Visual Content (No Image, just floating badges) */}
            <div className="lg:col-span-6 relative h-64 lg:h-96">
              
              <div className="absolute top-0 right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex gap-4 items-center animate-bounce-slow max-w-xs" style={{ animationDuration: '4s' }}>
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <Clock size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Wait Time</p>
                  <p className="text-xl font-black text-gray-900">0 Mins</p>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-0 sm:left-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex gap-4 items-center animate-bounce-slow" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileSignature size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Digital</p>
                  <p className="text-xl font-black text-gray-900">Prescription Ready</p>
                </div>
                <CheckCircle2 size={24} className="text-green-500 ml-2" />
              </div>

              <div className="absolute bottom-0 right-0 sm:right-20 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex gap-4 items-center animate-bounce-slow" style={{ animationDuration: '6s', animationDelay: '0.5s' }}>
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <HeartPulse size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Next Checkup</p>
                  <p className="text-xl font-black text-gray-900">Booked</p>
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

      {/* Benefits Grid */}
      <section id="benefits" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No More Waiting Rooms</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Experience healthcare that values your time. Everything you need is managed digitally.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 border border-gray-100 transition-colors group">
                <div className="w-14 h-14 bg-white text-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  {b.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24 text-center px-4 max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Is your clinic using Doctor CRM?</h2>
        <p className="text-lg text-gray-600 mb-8">Tell your doctor about the platform that makes healthcare easier for everyone.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl transition-colors shadow-xl shadow-blue-500/20">
          Get Started
        </Link>
      </section>
    </div>
  );
}
