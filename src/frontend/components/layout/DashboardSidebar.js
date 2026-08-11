"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavigationForRole } from "@/frontend/constants/navigation";

export default function DashboardSidebar({ user }) {
  const pathname = usePathname();
  
  // Use a fallback empty array if user is undefined to prevent crashes during initial render
  const navItems = user ? getNavigationForRole(user.role) : [];

  return (
    <div className="flex h-full w-64 flex-col overflow-y-auto bg-gradient-to-b from-[#0f3d69] to-[#15558d] text-white shadow-xl relative z-20">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <span className="text-xl font-black tracking-tight text-white relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">✚</span>
          </div>
          Doctor CRM
        </span>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md translate-x-1"
                  : "text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
