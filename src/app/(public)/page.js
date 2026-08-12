import Link from "next/link";
import { Calendar, Users, FileText, ClipboardList, Activity, CreditCard, ShieldCheck, Cloud, Clock, TrendingUp, Heart } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Clinora | Smart Clinic & Patient Management",
  description: "Clinora helps clinics streamline appointments, manage patients, consultations, prescriptions, reports and billing — all in one secure platform.",
};

export default function LandingPage() {
  return (
    <div className="font-sans w-full overflow-x-hidden bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#EAF3FF] to-transparent z-0"></div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-[#2563EB]/5 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-[#2563EB]/5 rounded-full blur-3xl z-0"></div>

        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#2563EB]/20 text-[#2563EB] text-sm font-semibold mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]"></span>
                </span>
                All-in-One Clinic Management
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-[#0F172A] leading-tight mb-6">
                Manage Your Clinic. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F4C81] to-[#2563EB]">
                  Focus on Your Patients.
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Clinora helps clinics streamline appointments, manage patients, consultations, prescriptions, reports and billing — all in one secure platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#2563EB] text-white font-bold shadow-lg shadow-[#2563EB]/25 hover:bg-[#1D4ED8] hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  Get Started Free
                </Link>
                <Link href="#demo" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white border border-gray-200 text-[#0F172A] font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all">
                  Watch Demo
                </Link>
              </div>
            </div>

            {/* Right Side Dashboard Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/20 to-[#2563EB]/20 rounded-3xl blur-2xl transform rotate-3 scale-105"></div>
              <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
                {/* Fake Browser Header */}
                <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  </div>
                  <div className="flex-1 mx-4 bg-white border border-gray-200 rounded-md h-6"></div>
                </div>
                {/* Fake Dashboard Content */}
                <div className="flex-1 bg-[#F8FAFC] p-4 md:p-6 grid grid-cols-12 gap-4">
                   {/* Sidebar Placeholder */}
                   <div className="col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm hidden md:block p-4 space-y-3">
                      <div className="w-full h-8 bg-gray-100 rounded-md mb-6"></div>
                      <div className="w-3/4 h-4 bg-blue-50 rounded-md"></div>
                      <div className="w-2/3 h-4 bg-gray-50 rounded-md"></div>
                      <div className="w-3/4 h-4 bg-gray-50 rounded-md"></div>
                      <div className="w-1/2 h-4 bg-gray-50 rounded-md"></div>
                   </div>
                   {/* Main Content Placeholder */}
                   <div className="col-span-12 md:col-span-9 space-y-4">
                      {/* Top Cards */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                          <div className="w-8 h-8 rounded-full bg-blue-50"></div>
                          <div className="w-1/2 h-4 bg-gray-100 rounded-md"></div>
                        </div>
                        <div className="h-24 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                          <div className="w-8 h-8 rounded-full bg-blue-50"></div>
                          <div className="w-1/2 h-4 bg-gray-100 rounded-md"></div>
                        </div>
                        <div className="h-24 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                          <div className="w-8 h-8 rounded-full bg-orange-50"></div>
                          <div className="w-1/2 h-4 bg-gray-100 rounded-md"></div>
                        </div>
                      </div>
                      {/* Main Chart area */}
                      <div className="h-48 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <div className="w-1/3 h-5 bg-gray-100 rounded-md mb-4"></div>
                        <div className="w-full h-full bg-gradient-to-t from-blue-50 to-transparent rounded-lg border-b-2 border-blue-200"></div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Everything You Need to Run Your Clinic</h2>
            <p className="text-gray-500 text-lg">Powerful modules designed specifically for modern healthcare providers and their patients.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all group">
              <div className="w-12 h-12 bg-blue-100 text-[#2563EB] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Appointments</h3>
              <p className="text-gray-600 leading-relaxed">Smart scheduling, conflict resolution, and automated reminders for both doctors and patients.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all group">
              <div className="w-12 h-12 bg-blue-100 text-[#2563EB] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Patients</h3>
              <p className="text-gray-600 leading-relaxed">Comprehensive patient profiles, medical history, vitals tracking, and family grouping.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all group">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Consultations</h3>
              <p className="text-gray-600 leading-relaxed">Dedicated consultation workspace for doctors to record notes, vitals, and diagnoses easily.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all group">
              <div className="w-12 h-12 bg-orange-100 text-[#F59E0B] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Prescriptions</h3>
              <p className="text-gray-600 leading-relaxed">Digital prescription generation, medicine database, and one-click printing or sharing.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all group">
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Reports</h3>
              <p className="text-gray-600 leading-relaxed">Secure upload, organization, and sharing of patient lab results and medical documents.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all group">
              <div className="w-12 h-12 bg-red-100 text-[#EF4444] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Billing</h3>
              <p className="text-gray-600 leading-relaxed">Generate invoices, record payments, manage outstanding balances, and track clinic revenue.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-[#0F4C81]">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 text-white">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-white font-bold mb-1">Secure</h4>
              <p className="text-blue-200 text-sm">Data protection</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 text-white">
                <Cloud className="w-8 h-8" />
              </div>
              <h4 className="text-white font-bold mb-1">Cloud Based</h4>
              <p className="text-blue-200 text-sm">Access anywhere</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 text-white">
                <Clock className="w-8 h-8" />
              </div>
              <h4 className="text-white font-bold mb-1">Save Time</h4>
              <p className="text-blue-200 text-sm">Automated workflows</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 text-white">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h4 className="text-white font-bold mb-1">Grow Clinic</h4>
              <p className="text-blue-200 text-sm">Scale operations</p>
            </div>

            <div className="flex flex-col items-center col-span-2 md:col-span-1 lg:col-span-1">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 text-white">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="text-white font-bold mb-1">Better Care</h4>
              <p className="text-blue-200 text-sm">Focus on patients</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
