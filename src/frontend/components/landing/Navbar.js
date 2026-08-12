import Link from "next/link";
import Logo from "@/frontend/components/branding/Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100/50 backdrop-blur-md shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[#2563EB] transition-colors">Home</Link>
          <Link href="/doctors" className="text-sm font-medium text-gray-600 hover:text-[#2563EB] transition-colors">Doctors</Link>
          <Link href="/patients" className="text-sm font-medium text-gray-600 hover:text-[#2563EB] transition-colors">Patients</Link>
          <Link href="/clinics" className="text-sm font-medium text-gray-600 hover:text-[#2563EB] transition-colors">Clinic</Link>
          <Link href="/#features" className="text-sm font-medium text-gray-600 hover:text-[#2563EB] transition-colors">Features</Link>
          <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-[#2563EB] transition-colors">Contact</Link>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:inline-flex text-sm font-semibold text-[#0F4C81] hover:text-[#2563EB] transition-colors">
            Login
          </Link>
          <Link href="/register" className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-[#2563EB] text-white text-sm font-bold shadow-md hover:bg-[#1D4ED8] hover:shadow-lg transition-all">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
