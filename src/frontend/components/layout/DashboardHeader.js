"use client";

import { useAuth } from "@/frontend/context/AuthContext";
import { useSidebar } from "@/frontend/context/SidebarContext";
import { usePathname } from "next/navigation";
import { Menu, Search, Bell } from "lucide-react";

export default function DashboardHeader({ user: serverUser }) {
  const { user: clientUser } = useAuth();
  const { toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  
  const user = clientUser || serverUser;

  if (!user) return null;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const displayRole = user.role ? user.role.replace("_", " ") : "User";

  // Basic page title from pathname
  let pageTitle = "Dashboard";
  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts.length > 1) {
    const lastPart = pathParts[pathParts.length - 1];
    // if lastPart is an ID (length > 20), use the previous part
    if (lastPart.length > 20 && pathParts.length > 2) {
      pageTitle = pathParts[pathParts.length - 2];
    } else {
      pageTitle = lastPart;
    }
  }
  // format title
  pageTitle = pageTitle.replace(/-/g, " ");
  pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-6 shadow-sm relative z-10 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <h1 className="text-xl font-bold text-[#0F172A] hidden sm:block capitalize">
          {pageTitle}
        </h1>

        {/* Search Desktop */}
        <div className="hidden lg:flex items-center ml-8 max-w-md w-full relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3" />
          <input 
            type="text" 
            placeholder="Search patients, appointments..." 
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-sm rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-5">
        <button className="relative p-2 text-[#64748B] hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#EF4444] rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-[#E2E8F0] hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm text-[#0F172A] font-bold tracking-tight leading-tight">{user.name}</span>
            <span className="text-xs font-semibold text-[#64748B] capitalize leading-tight">{displayRole}</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm shrink-0 border border-emerald-200/60">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
