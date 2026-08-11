import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24 bg-blue-600 font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
          Ready to Simplify Your Clinic?
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Manage your doctors, staff, patients and complete clinic workflow from one powerful platform.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/register" 
            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-xl flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight size={20} />
          </Link>
          <Link 
            href="/login" 
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}
