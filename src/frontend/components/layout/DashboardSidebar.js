"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getNavigationForRole } from "@/frontend/constants/navigation";
import { useSidebar } from "@/frontend/context/SidebarContext";
import { useAuth } from "@/frontend/context/AuthContext";
import {
  LayoutDashboard,
  CalendarPlus,
  Calendar,
  FileText,
  ShieldPlus,
  Wallet,
  User,
  Users,
  List,
  Settings,
  LogOut,
  X,
  CreditCard,
  CheckSquare,
  Building2
} from "lucide-react";
import Logo from "@/frontend/components/branding/Logo";

function getIconForLabel(label) {
  const l = label.toLowerCase();
  if (l.includes("dashboard")) return LayoutDashboard;
  if (l.includes("book appointment")) return CalendarPlus;
  if (l === "appointments" || l === "my appointments") return Calendar;
  if (l.includes("schedule")) return CalendarPlus;
  if (l.includes("earnings")) return Wallet;
  if (l.includes("prescription")) return FileText;
  if (l.includes("report")) return ShieldPlus;
  if (l.includes("billing") || l.includes("payment") || l.includes("invoice")) return Wallet;
  if (l.includes("profile")) return User;
  if (l.includes("doctor")) return Users;
  if (l.includes("patient") || l.includes("staff")) return Users;
  if (l.includes("queue")) return List;
  if (l.includes("setting")) return Settings;
  if (l.includes("transaction")) return CreditCard;
  if (l.includes("task")) return CheckSquare;
  return FileText;
}

export default function DashboardSidebar({ user }) {
  const pathname = usePathname();
  const { isMobileOpen, closeMobileSidebar } = useSidebar();
  const { logout } = useAuth();
  const [clinicProfile, setClinicProfile] = useState(null);

  const navItems = user ? getNavigationForRole(user.role) : [];

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const displayRole = user?.role ? user.role.replace("_", " ") : "User";

  // Fetch clinic profile to get logo and name
  useEffect(() => {
    const fetchClinicProfile = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success && data.clinic) {
          setClinicProfile(data.clinic);
        }
      } catch (err) {
        // silently fail - fall back to Clinora logo
      }
    };
    if (user?.role === "clinic_owner" || user?.role === "doctor" || user?.role === "receptionist" || user?.role === "assistant") {
      fetchClinicProfile();
    }
  }, [user?.role]);

  const clinicName = clinicProfile?.name || null;
  const clinicLogo = clinicProfile?.profile?.logoUrl || clinicProfile?.logoUrl || null;

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 flex flex-col bg-[#F8FAFC] text-[#0F172A] border-r border-[#E2E8F0]
    transition-transform duration-300 ease-in-out
    w-[260px] lg:translate-x-0 lg:static
    md:w-[260px]
    ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <div className={sidebarClasses}>
        {/* Top Brand Section */}
        <div className="shrink-0 pt-6 px-6 pb-6 relative flex justify-between items-start">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {clinicLogo ? (
              /* Clinic's own logo */
              <div className="flex items-center gap-2">
                <img
                  src={clinicLogo}
                  alt={clinicName || "Clinic Logo"}
                  className="h-10 w-10 rounded-xl object-cover border border-[#E2E8F0] shadow-sm shrink-0"
                />
                {clinicName && (
                  <span className="text-sm font-black text-[#0F172A] leading-tight truncate">
                    {clinicName}
                  </span>
                )}
              </div>
            ) : clinicName ? (
              /* Clinic name with icon placeholder (no logo uploaded yet) */
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-black text-[#0F172A] leading-tight truncate">
                  {clinicName}
                </span>
              </div>
            ) : (
              /* Fallback: Clinora logo */
              <div className="flex items-center">
                <Logo className="scale-90 origin-left" />
              </div>
            )}
            <p className="text-[0.65rem] font-semibold text-[#64748B] uppercase tracking-wider mt-1">
              Smart Clinic &<br/>Patient Management
            </p>
          </div>
          
          <button onClick={closeMobileSidebar} className="lg:hidden p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1.5 px-4 py-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = getIconForLabel(item.label);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMobileSidebar}
                className={`flex items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 shadow-sm"
                    : "text-[#64748B] hover:bg-gray-100 hover:text-[#0F172A]"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-[#64748B]"}`} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Card */}
        <div className="shrink-0 p-4 border-t border-[#E2E8F0] mt-auto">
          <div className="bg-white rounded-xl p-4 flex flex-col gap-4 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0 border border-emerald-200/60">
                {initials}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-[#0F172A] truncate">{user?.name}</span>
                <span className="text-xs font-semibold text-[#64748B] capitalize truncate">{displayRole}</span>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 hover:bg-red-50 text-[#64748B] hover:text-red-600 text-xs font-semibold rounded-lg transition-colors border border-gray-200"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
