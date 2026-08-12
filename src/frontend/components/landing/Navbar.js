"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/frontend/components/branding/Logo";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Clinics", href: "/clinics" },
    { name: "Patients", href: "/patients" },
    { name: "Features", href: "/features" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left: Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <Logo />
          <div className="hidden lg:block h-8 w-px bg-[#E2E8F0] mx-2"></div>
          <span className="hidden lg:block text-sm font-medium text-[#64748B]">
            Clinic Management Simplified
          </span>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`relative text-sm font-bold transition-colors py-2 ${
                isActive(link.href) ? "text-[#10B981]" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {link.name}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#10B981] rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right: CTA */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:inline-flex text-sm font-bold text-[#0F172A] hover:text-[#10B981] transition-colors">
            Login
          </Link>
          <Link href="/register" className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-[#10B981] text-[#FFFFFF] text-sm font-bold shadow-sm hover:bg-[#047857] hover:shadow-md transition-all">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
