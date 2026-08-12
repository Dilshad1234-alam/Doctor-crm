import Link from "next/link";
import { ShieldCheck, CalendarCheck, HeartPulse, Activity, BellRing, Smartphone, Stethoscope, ArrowRight } from "lucide-react";

export const metadata = {
  title: "For Patients | Clinora",
  description: "Experience hassle-free healthcare with Clinora. Find trusted clinics, book instantly, and track your health.",
};

export default function PatientsPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 lg:pt-32 lg:pb-24 bg-[#FFFFFF]">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl lg:text-5xl font-black text-[#0F172A] leading-tight mb-6">
                We Care for <br /> <span className="text-[#10B981]">Every Patient</span>
              </h1>
              <p className="text-lg text-[#64748B] mb-10 leading-relaxed">
                Take control of your health journey. Clinora empowers you to find the best doctors, book appointments, and access your medical records securely from anywhere.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "Find top-rated clinics near you",
                  "Book appointments in seconds",
                  "Access prescriptions and lab reports",
                  "Get automated reminders"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[#0F172A] font-medium">
                    <ShieldCheck className="w-6 h-6 text-[#10B981]" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4">
                <Link href="/clinics" className="px-8 py-3.5 rounded-xl bg-[#10B981] text-[#FFFFFF] font-bold shadow-md hover:bg-[#047857] transition-all">
                  Find Clinics
                </Link>
                <Link href="/register" className="px-8 py-3.5 rounded-xl bg-[#F8FAFC] text-[#0F172A] font-bold border border-[#E2E8F0] hover:bg-[#E2E8F0] transition-all">
                  Join Now
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#10B981]/10 rounded-[3rem] transform rotate-3 scale-105"></div>
              <img 
                src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=2000&auto=format&fit=crop" 
                alt="Happy Family" 
                className="relative w-full h-[500px] object-cover rounded-[3rem] shadow-2xl border-8 border-[#FFFFFF]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Everything You Need</h2>
            <p className="text-[#64748B] text-lg">A seamless digital healthcare experience designed for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E2E8F0] shadow-sm hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-[#ECFDF5] text-[#10B981] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Find Trusted Clinics</h3>
              <p className="text-[#64748B] leading-relaxed">Search through thousands of verified clinics and doctors based on your specific needs and location.</p>
            </div>
            
            <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E2E8F0] shadow-sm hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-[#EFF6FF] text-[#2563EB] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Book in Seconds</h3>
              <p className="text-[#64748B] leading-relaxed">View real-time availability and book your slots instantly without making any phone calls.</p>
            </div>

            <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E2E8F0] shadow-sm hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-[#FEF2F2] text-[#EF4444] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Track Your Health</h3>
              <p className="text-[#64748B] leading-relaxed">Access all your digital prescriptions, lab reports, and vital history from one secure dashboard.</p>
            </div>

            <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E2E8F0] shadow-sm hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-[#FFFBEB] text-[#F59E0B] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BellRing className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Stay Updated</h3>
              <p className="text-[#64748B] leading-relaxed">Receive automated reminders for upcoming appointments and medication schedules on your phone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0F172A]">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#FFFFFF] mb-6">Ready to prioritize your health?</h2>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto mb-10">Join thousands of patients who are already using Clinora to manage their healthcare effortlessly.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#10B981] text-[#FFFFFF] font-bold hover:bg-[#047857] transition-all">
            Get Started For Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
      
    </div>
  );
}
