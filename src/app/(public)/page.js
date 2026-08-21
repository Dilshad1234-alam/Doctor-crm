import Link from "next/link";
import { 
  MapPin, Stethoscope, Clock, ShieldCheck, 
  Smartphone, Search, CalendarCheck, BellRing,
  Activity, Baby, Smile, Phone, ArrowRight,
  Star, Heart
} from "lucide-react";
import { connectDB } from "@/backend/database/connectDB";
import ClinicProfile from "@/backend/models/ClinicProfile";

export const metadata = {
  title: "Clinora | Premium Healthcare Marketplace",
  description: "Find the best clinics, check availability, and book appointments seamlessly.",
};

export default async function LandingPage() {
  await connectDB();
  const clinics = await ClinicProfile.find({ isActive: true }).limit(5).lean();

  return (
    <div className="font-sans w-full overflow-x-hidden bg-[#F8FAFC]">
      
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <h1 className="text-5xl lg:text-6xl font-black text-[#0F172A] leading-tight mb-6">
                Find the Best <br />
                <span className="text-[#10B981]">Clinics Near You</span>
              </h1>
              <p className="text-lg text-[#64748B] mb-10 leading-relaxed">
                Book appointments and manage your health easily. Discover top-rated healthcare providers in your city and get the care you deserve.
              </p>
              
              {/* Search Bar */}
              <form action="/clinics" method="GET" className="flex flex-col sm:flex-row items-center gap-2 mb-12 bg-[#FFFFFF] p-3 rounded-2xl shadow-md border border-[#E2E8F0] w-full max-w-3xl">
                <div className="flex-1 w-full border-b sm:border-b-0 sm:border-r border-[#E2E8F0] flex items-center pr-2">
                  <div className="pl-3 text-[#64748B]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    name="state"
                    placeholder="State" 
                    className="w-full px-3 py-3 bg-transparent border-none focus:ring-0 text-[#0F172A] placeholder-[#64748B]"
                  />
                </div>
                <div className="flex-1 w-full border-b sm:border-b-0 sm:border-r border-[#E2E8F0] flex items-center pr-2">
                  <input 
                    type="text" 
                    name="city"
                    placeholder="City" 
                    className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-[#0F172A] placeholder-[#64748B]"
                  />
                </div>
                <div className="flex-1 w-full flex items-center pr-2">
                  <input 
                    type="text" 
                    name="area"
                    placeholder="Area / Locality" 
                    className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-[#0F172A] placeholder-[#64748B]"
                  />
                </div>
                <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#10B981] text-[#FFFFFF] font-bold shadow-md hover:bg-[#047857] transition-all whitespace-nowrap">
                  Search Clinics
                </button>
              </form>

              {/* Stats */}
              <div className="flex items-center gap-8 text-[#0F172A]">
                <div>
                  <h4 className="text-2xl font-black">10K+</h4>
                  <p className="text-sm text-[#64748B] font-medium">Clinics</p>
                </div>
                <div className="w-px h-8 bg-[#E2E8F0]"></div>
                <div>
                  <h4 className="text-2xl font-black">50K+</h4>
                  <p className="text-sm text-[#64748B] font-medium">Doctors</p>
                </div>
                <div className="w-px h-8 bg-[#E2E8F0]"></div>
                <div>
                  <h4 className="text-2xl font-black">1M+</h4>
                  <p className="text-sm text-[#64748B] font-medium">Patients</p>
                </div>
                <div className="w-px h-8 bg-[#E2E8F0]"></div>
                <div>
                  <h4 className="text-2xl font-black flex items-center gap-1">
                    4.8 <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                  </h4>
                  <p className="text-sm text-[#64748B] font-medium">Rating</p>
                </div>
              </div>
            </div>

            {/* Right Side Image */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/20 to-[#2563EB]/20 rounded-[3rem] blur-3xl transform rotate-3 scale-105"></div>
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop" 
                alt="Modern Clinic" 
                className="relative w-full h-[600px] object-cover rounded-[3rem] shadow-2xl border-8 border-[#FFFFFF]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Specialties Section */}
      <section className="py-24 bg-[#FFFFFF]">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Popular Specialties</h2>
              <p className="text-[#64748B] text-lg">Consult with top doctors across various specialties.</p>
            </div>
            <Link href="/clinics" className="inline-flex items-center gap-2 font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
              View All Specialties <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "General Physician", count: "2.4K Clinics", icon: Stethoscope },
              { name: "Dentist", count: "1.8K Clinics", icon: Smile },
              { name: "Pediatrician", count: "1.2K Clinics", icon: Baby },
              { name: "Dermatologist", count: "950 Clinics", icon: Activity },
              { name: "Gynecologist", count: "1.5K Clinics", icon: Heart },
              { name: "Orthopedic", count: "1.1K Clinics", icon: Activity }
            ].map((spec, idx) => {
              const Icon = spec.icon;
              return (
                <div key={idx} className="bg-[#F8FAFC] rounded-2xl p-6 border border-[#E2E8F0] hover:shadow-md hover:border-[#10B981] transition-all group cursor-pointer flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFFFFF] shadow-sm flex items-center justify-center text-[#2563EB] group-hover:text-[#10B981] group-hover:scale-110 transition-all shrink-0">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-1">{spec.name}</h3>
                    <p className="text-[#64748B] text-sm">{spec.count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">How It Works</h2>
            <p className="text-[#64748B] text-lg">Book your appointment in 4 simple steps.</p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-[#E2E8F0]"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
              {[
                { title: "Search Clinics", desc: "Find clinics by specialty or location", icon: Search },
                { title: "Choose Doctor & Slot", desc: "Select an available time that suits you", icon: CalendarCheck },
                { title: "Book Appointment", desc: "Confirm your booking instantly online", icon: ShieldCheck },
                { title: "Get Reminders", desc: "Receive SMS or email notifications", icon: BellRing }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-[#FFFFFF] shadow-md border border-[#E2E8F0] flex items-center justify-center text-[#2563EB] mb-6 relative">
                      <Icon className="w-10 h-10" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#10B981] text-[#FFFFFF] rounded-full flex items-center justify-center font-bold border-4 border-[#F8FAFC]">
                        {idx + 1}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-2">{step.title}</h3>
                    <p className="text-[#64748B]">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Top Rated Clinics Section */}
      <section className="py-24 bg-[#FFFFFF]">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Top Rated Clinics</h2>
              <p className="text-[#64748B] text-lg">Experience premium healthcare with the best clinics.</p>
            </div>
            <Link href="/clinics" className="inline-flex items-center gap-2 font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
              View All Clinics <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {clinics.map((clinic, idx) => {
              // Add some visual variety using predefined images based on index
              const images = [
                "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop"
              ];
              const clinicImage = images[idx % images.length];

              return (
                <div key={clinic._id} className="bg-[#FFFFFF] rounded-2xl shadow-sm hover:shadow-lg transition-all border border-[#E2E8F0] overflow-hidden flex flex-col group">
                  <div className="h-48 relative overflow-hidden bg-gray-100">
                    <img src={clinicImage} alt={clinic.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-[#FFFFFF] px-2.5 py-1 rounded-full text-xs font-bold text-[#10B981] flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" /> {(4.5 + Math.random() * 0.5).toFixed(1)}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-[#0F172A] mb-1 line-clamp-1">{clinic.name}</h3>
                    <div className="flex items-center gap-1.5 text-[#64748B] text-xs mb-3">
                      <MapPin className="w-3 h-3" /> {clinic.city || "New Delhi"}, {clinic.state || "DL"}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      <span className="bg-[#F8FAFC] text-[#64748B] px-2 py-1 rounded text-xs font-medium">Multispeciality</span>
                      <span className="bg-[#F8FAFC] text-[#64748B] px-2 py-1 rounded text-xs font-medium">General</span>
                    </div>
                    <div className="mt-auto pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Contact</p>
                        <p className="font-bold text-[#0F172A] text-xs truncate max-w-[100px]">{clinic.phone || clinic.email}</p>
                      </div>
                      <Link href={`/clinics/${clinic.slug || clinic._id}`} className="text-sm font-bold text-[#2563EB] hover:text-[#10B981] transition-colors">
                        View Clinic
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. App CTA Section */}
      <section className="py-20 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="bg-gradient-to-r from-[#047857] to-[#10B981] rounded-[3rem] overflow-hidden relative shadow-2xl">
            {/* Decorative BG */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center relative z-10 px-8 py-16 lg:p-20">
              <div className="mb-12 lg:mb-0 lg:pr-12 text-center lg:text-left">
                <h2 className="text-4xl lg:text-5xl font-black text-[#FFFFFF] mb-6 leading-tight">
                  Your Health, <br /> Our Priority.
                </h2>
                <p className="text-[#A7F3D0] text-lg lg:text-xl mb-10 max-w-lg mx-auto lg:mx-0">
                  Download the Clinora app to book appointments instantly, manage your records, and consult with doctors on the go.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <button className="flex items-center gap-3 bg-[#FFFFFF] text-[#0F172A] px-6 py-3 rounded-xl hover:bg-[#F8FAFC] transition-colors shadow-lg">
                    <Smartphone className="w-8 h-8" />
                    <div className="text-left">
                      <p className="text-xs text-[#64748B] font-medium leading-none mb-1">Get it on</p>
                      <p className="font-bold leading-none text-sm">Google Play</p>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 bg-[#0F172A] text-[#FFFFFF] px-6 py-3 rounded-xl hover:bg-[#1E293B] transition-colors shadow-lg border border-[#334155]">
                    <Smartphone className="w-8 h-8" />
                    <div className="text-left">
                      <p className="text-xs text-gray-400 font-medium leading-none mb-1">Download on the</p>
                      <p className="font-bold leading-none text-sm">App Store</p>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center lg:justify-end items-center gap-8 relative">
                <div className="w-64 h-[500px] bg-[#FFFFFF] rounded-[2.5rem] shadow-2xl border-8 border-[#E2E8F0] overflow-hidden relative hidden md:block rotate-[-10deg] translate-y-8">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-[#E2E8F0] rounded-b-xl z-20"></div>
                  <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop" alt="App screen 1" className="w-full h-full object-cover" />
                </div>
                <div className="w-72 h-[550px] bg-[#FFFFFF] rounded-[3rem] shadow-2xl border-8 border-[#F8FAFC] overflow-hidden relative z-10">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-[#F8FAFC] rounded-b-xl z-20"></div>
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop" alt="App screen 2" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
